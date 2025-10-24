import { createClient } from '@supabase/supabase-js';

const supabaseProjectUrl = 'https://vhtmwpsndcqnncskpspz.supabase.co';
const supabaseAPIKey = 'sb_publishable_-a9LVPakVcIhE1VtpKf6lg_D7edIJ-G';

const supabase = createClient(
	supabaseProjectUrl,
	supabaseAPIKey,
	{
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			storageKey: 'CustomApp',
			storage: window.localStorage,
			flowType: 'pkce'
		}
	}
);

export default supabase;
