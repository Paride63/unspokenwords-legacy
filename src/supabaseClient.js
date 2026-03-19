import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bdubnrittlbueuyediin.supabase.co'
const supabaseKey = 'sb_publishable_gr_yQcthEteaNeSvfdboLg_MsFN7tQg'

export const supabase = createClient(supabaseUrl, supabaseKey)