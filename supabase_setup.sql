-- ユーザープロフィールテーブルの作成
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- unko_recordsテーブルにuser_idカラムを追加（既存テーブルがある場合）
ALTER TABLE unko_records 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 作成日時と更新日時のカラムを追加
ALTER TABLE unko_records 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- timeカラムをtime(0)に変更して秒を排除
ALTER TABLE unko_records 
ALTER COLUMN time TYPE time(0);

-- RLSを有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE unko_records ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（テーブルが存在する場合のみ）
DO $$
BEGIN
  -- user_profilesのポリシーを削除
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles') THEN
    DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  END IF;
  
  -- unko_recordsのポリシーを削除
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'unko_records') THEN
    DROP POLICY IF EXISTS "Users can view own records" ON unko_records;
    DROP POLICY IF EXISTS "Users can insert own records" ON unko_records;
    DROP POLICY IF EXISTS "Users can update own records" ON unko_records;
    DROP POLICY IF EXISTS "Users can delete own records" ON unko_records;
  END IF;
END $$;

-- ユーザープロフィールのポリシー
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id);

-- unko_recordsのポリシー
CREATE POLICY "Users can view own records" ON unko_records
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON unko_records
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records" ON unko_records
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records" ON unko_records
FOR DELETE USING (auth.uid() = user_id);

-- 新しいユーザーが登録された時に自動的にプロフィールを作成するトリガー関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 更新日時を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルに更新日時トリガーを追加
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_unko_records_updated_at ON unko_records;
CREATE TRIGGER update_unko_records_updated_at
    BEFORE UPDATE ON unko_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 