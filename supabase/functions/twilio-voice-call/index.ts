import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

// Declare EdgeRuntime for background tasks
declare const EdgeRuntime: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CallRequest {
  phoneNumber: string;
  contactName: string;
  contactId: string;
  sosAlertId: string;
  userLocation?: string;
  attemptNumber?: number;
  maxRetries?: number;
  retryIntervalMinutes?: number;
}

// Helper function to check call status
async function checkCallStatus(accountSid: string, authToken: string, callSid: string) {
  const auth = btoa(`${accountSid}:${authToken}`);
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${callSid}.json`,
    {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    }
  );
  
  if (response.ok) {
    const data = await response.json();
    return data.status;
  }
  return null;
}

// Helper function to schedule retry
async function scheduleRetry(
  supabase: any,
  callLogId: string,
  phoneNumber: string,
  contactName: string,
  contactId: string,
  sosAlertId: string,
  userLocation: string | undefined,
  attemptNumber: number,
  maxRetries: number,
  retryIntervalMinutes: number
) {
  if (attemptNumber >= maxRetries) {
    console.log(`Max retries (${maxRetries}) reached for ${contactName}`);
    await supabase
      .from('sos_call_logs')
      .update({ status: 'failed_max_retries' })
      .eq('id', callLogId);
    return;
  }

  const retryDelayMs = retryIntervalMinutes * 60 * 1000;
  
  console.log(`Scheduling retry ${attemptNumber + 1} for ${contactName} in ${retryIntervalMinutes} minutes`);
  
  // Use EdgeRuntime.waitUntil for background task
  EdgeRuntime.waitUntil(
    (async () => {
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      
      // Make retry call
      const retryUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/twilio-voice-call`;
      await fetch(retryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          phoneNumber,
          contactName,
          contactId,
          sosAlertId,
          userLocation,
          attemptNumber: attemptNumber + 1,
          maxRetries,
          retryIntervalMinutes,
        }),
      });
    })()
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      phoneNumber, 
      contactName, 
      contactId,
      sosAlertId,
      userLocation,
      attemptNumber = 1,
      maxRetries = 3,
      retryIntervalMinutes = 2
    }: CallRequest = await req.json();
    
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!accountSid || !authToken || !twilioPhone) {
      throw new Error('Twilio credentials not configured');
    }

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Initiating call attempt ${attemptNumber} to ${contactName} at ${phoneNumber}`);

    // Create TwiML message
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
          This is an automated emergency message.
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

    // Log the call attempt
    const { data: callLog, error: logError } = await supabase
      .from('sos_call_logs')
      .insert({
        sos_alert_id: sosAlertId,
        contact_id: contactId,
        phone_number: phoneNumber,
        contact_name: contactName,
        call_sid: data.sid,
        status: 'initiated',
        attempt_number: attemptNumber,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging call:', logError);
    }

    // Check call status after a brief delay and handle retries
    if (callLog) {
      EdgeRuntime.waitUntil(
        (async () => {
          // Wait for call to connect (30 seconds)
          await new Promise(resolve => setTimeout(resolve, 30000));
          
          const callStatus = await checkCallStatus(accountSid, authToken, data.sid);
          console.log(`Call ${data.sid} status: ${callStatus}`);
          
          if (callStatus) {
            await supabase
              .from('sos_call_logs')
              .update({ status: callStatus })
              .eq('id', callLog.id);

            // Retry if call was not answered
            if (callStatus === 'no-answer' || callStatus === 'busy' || callStatus === 'failed') {
              await scheduleRetry(
                supabase,
                callLog.id,
                phoneNumber,
                contactName,
                contactId,
                sosAlertId,
                userLocation,
                attemptNumber,
                maxRetries,
                retryIntervalMinutes
              );
            }
          }
        })()
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        callSid: data.sid,
        attemptNumber,
        message: `Call attempt ${attemptNumber} initiated to ${contactName}` 
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
