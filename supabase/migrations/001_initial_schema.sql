-- ═══════════════════════════════════════════════════════════════
-- WAFR (وفّر) — Complete Database Schema
-- Supabase Postgres Migration
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users / Profiles ───
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT '',
  email TEXT,
  phone TEXT,
  country TEXT DEFAULT 'EG',
  currency TEXT DEFAULT 'EGP',
  income NUMERIC DEFAULT 0,
  top_spend TEXT[] DEFAULT '{}',
  avg_waste NUMERIC DEFAULT 3000,
  avatar_url TEXT,
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Subscriptions ───
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','weekly','monthly','yearly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','trialing','past_due','canceled','expired')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─── Expenses ───
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL DEFAULT 'other',
  merchant TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual','sms','ocr','bank_api','recurring')),
  auto_detected BOOLEAN DEFAULT FALSE,
  confidence NUMERIC DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  receipt_url TEXT,
  notes TEXT,
  recurring_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, date DESC);
CREATE INDEX idx_expenses_category ON public.expenses(user_id, category);

-- ─── Savings Goals ───
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target NUMERIC NOT NULL CHECK (target > 0),
  saved NUMERIC DEFAULT 0 CHECK (saved >= 0),
  deadline DATE,
  icon TEXT DEFAULT '⭐',
  color TEXT DEFAULT '#00D4AA',
  auto_save_enabled BOOLEAN DEFAULT FALSE,
  auto_save_amount NUMERIC DEFAULT 0,
  auto_save_frequency TEXT DEFAULT 'monthly',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Budgets ───
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  period TEXT DEFAULT 'monthly',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- ─── Recurring Expenses ───
CREATE TABLE public.recurring_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT DEFAULT 'bills',
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('daily','weekly','biweekly','monthly','quarterly','yearly')),
  next_due DATE,
  last_charged DATE,
  auto_detected BOOLEAN DEFAULT FALSE,
  merchant TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  notify_before_days INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Raw Transactions (SMS/OCR parsed) ───
CREATE TABLE public.transactions_raw (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('sms','ocr','bank_api')),
  raw_text TEXT,
  parsed_amount NUMERIC,
  parsed_merchant TEXT,
  parsed_date TIMESTAMPTZ,
  category_suggestion TEXT,
  confidence NUMERIC DEFAULT 0.5,
  processed BOOLEAN DEFAULT FALSE,
  approved BOOLEAN,
  expense_id UUID REFERENCES public.expenses(id) ON DELETE SET NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_raw_transactions_user ON public.transactions_raw(user_id, processed, created_at DESC);

-- ─── AI Chat History ───
CREATE TABLE public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','ai','system')),
  text TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_user ON public.ai_chat_history(user_id, created_at DESC);

-- ─── Achievements ───
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ─── Challenge Log ───
CREATE TABLE public.challenge_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  completed_at DATE DEFAULT CURRENT_DATE,
  points INTEGER DEFAULT 0,
  UNIQUE(user_id, completed_at)
);

-- ─── User Gamification Stats (materialized for performance) ───
CREATE TABLE public.gamification_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_challenge_date DATE,
  total_challenges INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Settings ───
CREATE TABLE public.settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'en',
  notifications BOOLEAN DEFAULT TRUE,
  budget_reset_day INTEGER DEFAULT 1,
  theme TEXT DEFAULT 'dark',
  sms_parsing_enabled BOOLEAN DEFAULT FALSE,
  receipt_scanning_enabled BOOLEAN DEFAULT FALSE,
  round_up_enabled BOOLEAN DEFAULT FALSE,
  round_up_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Merchants Database (MENA-specific) ───
CREATE TABLE public.merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  category TEXT NOT NULL,
  logo_url TEXT,
  country TEXT,
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_merchants_name ON public.merchants USING gin(name gin_trgm_ops);

-- ─── Debts ───
CREATE TABLE public.debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'loan' CHECK (type IN ('loan','credit_card','bnpl','personal','mortgage','other')),
  total_amount NUMERIC NOT NULL,
  remaining_amount NUMERIC NOT NULL,
  interest_rate NUMERIC DEFAULT 0,
  minimum_payment NUMERIC DEFAULT 0,
  due_date DATE,
  lender TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Bill Splits ───
CREATE TABLE public.bill_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES public.expenses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'EGP',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.bill_split_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  split_id UUID NOT NULL REFERENCES public.bill_splits(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  amount NUMERIC NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Family Members ───
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('spouse','child','parent','member')),
  allowance NUMERIC DEFAULT 0,
  allowance_frequency TEXT DEFAULT 'monthly',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security ───
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_split_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Profiles: users can CRUD their own
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Generic user_id policies for all tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN VALUES
    ('subscriptions'),('expenses'),('goals'),('budgets'),
    ('recurring_expenses'),('transactions_raw'),('ai_chat_history'),
    ('achievements'),('challenge_log'),('debts'),('bill_splits'),('family_members')
  LOOP
    EXECUTE format('CREATE POLICY "Users can select own %s" ON public.%s FOR SELECT USING (auth.uid() = user_id)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Users can insert own %s" ON public.%s FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Users can update own %s" ON public.%s FOR UPDATE USING (auth.uid() = user_id)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Users can delete own %s" ON public.%s FOR DELETE USING (auth.uid() = user_id)', tbl, tbl);
  END LOOP;
END $$;

-- Settings: user_id-based
CREATE POLICY "Users can select own settings" ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.settings FOR UPDATE USING (auth.uid() = user_id);

-- Gamification stats
CREATE POLICY "Users can select own stats" ON public.gamification_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.gamification_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.gamification_stats FOR UPDATE USING (auth.uid() = user_id);

-- Bill split participants: accessible if you own the split
CREATE POLICY "Users can view own split participants" ON public.bill_split_participants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bill_splits bs WHERE bs.id = split_id AND bs.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own split participants" ON public.bill_split_participants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.bill_splits bs WHERE bs.id = split_id AND bs.user_id = auth.uid())
  );
CREATE POLICY "Users can update own split participants" ON public.bill_split_participants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.bill_splits bs WHERE bs.id = split_id AND bs.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own split participants" ON public.bill_split_participants
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.bill_splits bs WHERE bs.id = split_id AND bs.user_id = auth.uid())
  );

-- Merchants: public read, admin write
CREATE POLICY "Anyone can read merchants" ON public.merchants FOR SELECT TO authenticated USING (true);

-- ─── Auto-create profile on signup ───
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);

  INSERT INTO public.gamification_stats (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Seed MENA Merchants ───
INSERT INTO public.merchants (name, name_ar, category, country, keywords) VALUES
  ('Talabat', 'طلبات', 'food', 'EG', ARRAY['talabat','طلبات']),
  ('Elmenus', 'المنيوز', 'food', 'EG', ARRAY['elmenus','المنيوز']),
  ('Breadfast', 'بريدفاست', 'groceries', 'EG', ARRAY['breadfast','بريدفاست']),
  ('Instashop', 'انستاشوب', 'groceries', 'EG', ARRAY['instashop']),
  ('Seoudi Market', 'سعودي ماركت', 'groceries', 'EG', ARRAY['seoudi','سعودي']),
  ('Kazyon', 'كازيون', 'groceries', 'EG', ARRAY['kazyon','كازيون']),
  ('Carrefour Egypt', 'كارفور', 'groceries', 'EG', ARRAY['carrefour','كارفور']),
  ('Uber Egypt', 'أوبر', 'transport', 'EG', ARRAY['uber','أوبر']),
  ('Careem', 'كريم', 'transport', 'EG', ARRAY['careem','كريم']),
  ('SWVL', 'سويفل', 'transport', 'EG', ARRAY['swvl','سويفل']),
  ('InDrive', 'ان درايف', 'transport', 'EG', ARRAY['indrive']),
  ('Vodafone Egypt', 'فودافون', 'bills', 'EG', ARRAY['vodafone','فودافون']),
  ('Orange Egypt', 'اورنج', 'bills', 'EG', ARRAY['orange','اورنج']),
  ('Etisalat Egypt', 'اتصالات', 'bills', 'EG', ARRAY['etisalat','اتصالات','e&']),
  ('WE Egypt', 'وي', 'bills', 'EG', ARRAY['we','وي','telecom egypt']),
  ('Netflix', 'نتفلكس', 'entertainment', 'EG', ARRAY['netflix','نتفلكس']),
  ('Shahid', 'شاهد', 'entertainment', 'EG', ARRAY['shahid','شاهد']),
  ('Spotify', 'سبوتيفاي', 'entertainment', 'EG', ARRAY['spotify']),
  ('Amazon.eg', 'أمازون', 'shopping', 'EG', ARRAY['amazon','أمازون']),
  ('Noon', 'نون', 'shopping', 'EG', ARRAY['noon','نون']),
  ('Jumia', 'جوميا', 'shopping', 'EG', ARRAY['jumia','جوميا']),
  ('ValU', 'ڤاليو', 'bills', 'EG', ARRAY['valu','ڤاليو','value']),
  ('Sympl', 'سيمبل', 'bills', 'EG', ARRAY['sympl','سيمبل']),
  ('Shahry', 'شهري', 'bills', 'EG', ARRAY['shahry','شهري']),
  ('Costa Coffee', 'كوستا', 'food', 'EG', ARRAY['costa','كوستا']),
  ('Starbucks', 'ستاربكس', 'food', 'EG', ARRAY['starbucks','ستاربكس']),
  ('McDonald''s Egypt', 'ماكدونالدز', 'food', 'EG', ARRAY['mcdonald','ماكدونالدز']),
  ('Fawry', 'فوري', 'bills', 'EG', ARRAY['fawry','فوري']),
  ('CIB', 'سي اي بي', 'other', 'EG', ARRAY['cib','البنك التجاري']),
  ('NBE', 'البنك الأهلي', 'other', 'EG', ARRAY['nbe','الاهلي','ahly']),
  -- Saudi Arabia
  ('Jahez', 'جاهز', 'food', 'SA', ARRAY['jahez','جاهز']),
  ('HungerStation', 'هنقرستيشن', 'food', 'SA', ARRAY['hungerstation','هنقرستيشن']),
  ('Tamara', 'تمارا', 'bills', 'SA', ARRAY['tamara','تمارا']),
  ('Tabby', 'تابي', 'bills', 'SA', ARRAY['tabby','تابي']),
  ('STC', 'اس تي سي', 'bills', 'SA', ARRAY['stc','اس تي سي']),
  -- UAE
  ('Deliveroo', 'دليفرو', 'food', 'AE', ARRAY['deliveroo','دليفرو']),
  ('Zomato', 'زوماتو', 'food', 'AE', ARRAY['zomato','زوماتو']),
  ('du', 'دو', 'bills', 'AE', ARRAY['du','دو']),
  ('Etisalat UAE', 'اتصالات', 'bills', 'AE', ARRAY['etisalat','اتصالات','e&']);
