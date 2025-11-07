import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CallRequest {
  phoneNumber: string;
  contactName: string;
  userLocation?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, contactName, userLocation }: CallRequest = await req.json();
    
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !twilioPhone) {
      throw new Error('Twilio credentials not configured');
    }

    console.log(`Initiating call to ${contactName} at ${phoneNumber}`);

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
