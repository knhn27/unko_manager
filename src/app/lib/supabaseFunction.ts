import { supabase } from "./supabaseClient";

// ユーザー情報をDBに保存
export const createUserProfile = async (userId: string, email: string, name: string) => {
  const { error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email: email,
      name: name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error creating user profile:', error);
  }
};

// ユーザープロフィールを取得
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

// ユーザープロフィールを更新
export const updateUserProfile = async (userId: string, updates: any) => {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating user profile:', error);
  }
};

//select all data from unko_records for current user
export const selectAllData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const unkoData = await supabase
        .from('unko_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
    
    console.log(unkoData.data);
    return unkoData.data;
}

//Insert data into unko_records for current user
export const insertData = async (date: string, time: string, shape: string, notes: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data:insertedData, error } = await supabase
        .from('unko_records')
        .insert({
            date: date, 
            time: time, 
            shape: shape, 
            notes: notes,
            user_id: user.id
        });
    
    if (error) {
        console.error(error);
    }
}

//delete data from unko_records for current user
export const deleteData = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
        .from('unko_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
    
    if (error) {
        console.error(error);
    }
}

//update data in unko_records for current user
export const updateData = async (id: string, data: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data:updatedData, error } = await supabase
        .from('unko_records')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id);
    
    if (error) {
        console.error(error);
    }
}

//delete all data for current user
export const deleteAllData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('unko_records')
        .delete()
        .eq('user_id', user.id);
    
    if (error) {
        console.error(error);
    }
}