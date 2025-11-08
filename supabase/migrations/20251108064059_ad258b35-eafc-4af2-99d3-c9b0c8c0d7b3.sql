-- Create table for tracking SOS call logs
CREATE TABLE public.sos_call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sos_alert_id UUID REFERENCES public.sos_alerts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.emergency_contacts(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  call_sid TEXT,
  status TEXT NOT NULL DEFAULT 'initiated',
  attempt_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for retry configuration
CREATE TABLE public.retry_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  max_retry_attempts INTEGER NOT NULL DEFAULT 3,
  retry_interval_minutes INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.sos_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retry_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for sos_call_logs
CREATE POLICY "Users can view their own call logs"
ON public.sos_call_logs
FOR SELECT
USING (
  sos_alert_id IN (
    SELECT id FROM public.sos_alerts WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own call logs"
ON public.sos_call_logs
FOR INSERT
WITH CHECK (
  sos_alert_id IN (
    SELECT id FROM public.sos_alerts WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own call logs"
ON public.sos_call_logs
FOR UPDATE
USING (
  sos_alert_id IN (
    SELECT id FROM public.sos_alerts WHERE user_id = auth.uid()
  )
);

-- RLS policies for retry_settings
CREATE POLICY "Users can view their own retry settings"
ON public.retry_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own retry settings"
ON public.retry_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own retry settings"
ON public.retry_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_sos_call_logs_updated_at
BEFORE UPDATE ON public.sos_call_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_retry_settings_updated_at
BEFORE UPDATE ON public.retry_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert default retry settings for existing users
INSERT INTO public.retry_settings (user_id, max_retry_attempts, retry_interval_minutes)
SELECT id, 3, 2 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;