import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CallRequest {
  phoneNumber: string;
  contactName: string;
  userLocation?: string;
  sosAlertId: string;
  contactId: string;
  attemptNumber?: number;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, contactName, userLocation, sosAlertId, contactId, attemptNumber = 1, userId }: CallRequest = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !twilioPhone) {
      throw new Error('Twilio credentials not configured');
    }

    console.log(`Initiating call to ${contactName} at ${phoneNumber} (Attempt ${attemptNumber})`);

    // Create TwiML message
    const locationText = userLocation 
      ? `The person is located at ${userLocation}.`
      : 'Location information is not available.';
    
    const attemptText = attemptNumber > 1 ? ` This is attempt number ${attemptNumber}.` : '';
    
    const twimlMessage = `
      <Response>
        <Say voice="alice">
          This is an emergency alert from SheShield Safety App.
          ${contactName}, your contact has triggered an SOS alert and needs immediate help.
          ${locationText}
          Please check the app for real-time location tracking.
          This is an automated emergency message.${attemptText}
        </Say>
      </Response>
    `;

    // Make call using Twilio API
    const auth = btoa(`${accountSid}:${authToken}`);
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phoneNumber,
          From: twilioPhone,
          Twiml: twimlMessage,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Twilio API error:', error);
      throw new Error(`Failed to initiate call: ${error}`);
    }

    const data = await response.json();
    console.log('Call initiated successfully:', data.sid);

    // Log the call in database
    const { error: logError } = await supabase
      .from('sos_call_logs')
      .insert({
        sos_alert_id: sosAlertId,
        contact_id: contactId,
        phone_number: phoneNumber,
        contact_name: contactName,
        call_sid: data.sid,
        status: 'initiated',
        attempt_number: attemptNumber,
      });

    if (logError) {
      console.error('Failed to log call:', logError);
    }

    // Schedule retry check in background
    scheduleRetryCheck(supabase, data.sid, sosAlertId, contactId, phoneNumber, contactName, userLocation, attemptNumber, userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        callSid: data.sid,
        message: `Call initiated to ${contactName}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function scheduleRetryCheck(
  supabase: any,
  callSid: string,
  sosAlertId: string,
  contactId: string,
  phoneNumber: string,
  contactName: string,
  userLocation: string | undefined,
  attemptNumber: number,
  userId: string
) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

  // Run retry check in background without blocking
  (async () => {
    try {
      // Get retry settings for user
      const { data: retrySettings } = await supabase
        .from('retry_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const maxRetries = retrySettings?.max_retry_attempts || 3;
      const retryInterval = retrySettings?.retry_interval_minutes || 2;

      console.log(`Scheduling retry check for ${contactName} in ${retryInterval} minutes (attempt ${attemptNumber}/${maxRetries})`);

      // Wait for retry interval before checking status
      await new Promise(resolve => setTimeout(resolve, retryInterval * 60 * 1000));

      // Check call status
      const auth = btoa(`${accountSid}:${authToken}`);
      const statusResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${callSid}.json`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
          },
        }
      );

      if (statusResponse.ok) {
        const callData = await statusResponse.json();
        const status = callData.status; // busy, no-answer, canceled, completed, failed

        // Update call log status
        await supabase
          .from('sos_call_logs')
          .update({ status })
          .eq('call_sid', callSid);

        console.log(`Call ${callSid} to ${contactName} status: ${status}`);

        // Retry if call was not answered and we haven't exceeded max retries
        if ((status === 'no-answer' || status === 'busy' || status === 'failed') && attemptNumber < maxRetries) {
          console.log(`Retrying call to ${contactName}, attempt ${attemptNumber + 1}/${maxRetries}`);

          // Trigger new call
          const locationText = userLocation 
            ? `The person is located at ${userLocation}.`
            : 'Location information is not available.';
          
          const twimlMessage = `
            <Response>
              <Say voice="alice">
                This is an emergency alert from SheShield Safety App.
                ${contactName}, your contact has triggered an SOS alert and needs immediate help.
                ${locationText}
                Please check the app for real-time location tracking.
                This is an automated emergency message. Attempt ${attemptNumber + 1}.
              </Say>
            </Response>
          `;

          const retryResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                To: phoneNumber,
                From: Deno.env.get('TWILIO_PHONE_NUMBER')!,
                Twiml: twimlMessage,
              }),
            }
          );

          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            console.log(`Retry call initiated successfully to ${contactName}:`, retryData.sid);
            
            // Log retry attempt
            await supabase
              .from('sos_call_logs')
              .insert({
                sos_alert_id: sosAlertId,
                contact_id: contactId,
                phone_number: phoneNumber,
                contact_name: contactName,
                call_sid: retryData.sid,
                status: 'initiated',
                attempt_number: attemptNumber + 1,
              });

            // Schedule another retry check
            scheduleRetryCheck(supabase, retryData.sid, sosAlertId, contactId, phoneNumber, contactName, userLocation, attemptNumber + 1, userId);
          } else {
            const retryError = await retryResponse.text();
            console.error(`Failed to initiate retry call to ${contactName}:`, retryError);
          }
        } else if (attemptNumber >= maxRetries) {
          console.log(`Max retry attempts (${maxRetries}) reached for ${contactName}`);
        } else {
          console.log(`Call to ${contactName} completed with status: ${status}`);
        }
      }
    } catch (error) {
      console.error('Error in retry check:', error);
    }
  })().catch(err => console.error('Background task error:', err));
}
