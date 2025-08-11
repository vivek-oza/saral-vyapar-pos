const { supabase } = require('./supabase');

// Helper function to run insert/update/delete queries
const runQuery = async (table, operation, data, filters = null) => {
  try {
    let query = supabase.from(table);

    switch (operation) {
      case 'insert':
        const { data: insertData, error: insertError } = await query.insert(data).select().single();
        if (insertError) throw insertError;
        return { id: insertData.id, data: insertData };

      case 'update':
        const { data: updateData, error: updateError } = await query.update(data).match(filters).select().single();
        if (updateError) throw updateError;
        return { data: updateData };

      case 'delete':
        const { error: deleteError } = await query.delete().match(filters);
        if (deleteError) throw deleteError;
        return { success: true };

      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  } catch (error) {
    console.error(`Database ${operation} error:`, error);
    throw error;
  }
};

// Helper function to get a single record
const getQuery = async (table, filters, select = '*') => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .match(filters)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Database get error:', error);
    throw error;
  }
};

// Helper function to get multiple records
const allQuery = async (table, filters = {}, select = '*', orderBy = null) => {
  try {
    let query = supabase.from(table).select(select);

    if (Object.keys(filters).length > 0) {
      query = query.match(filters);
    }

    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending || false });
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Database all query error:', error);
    throw error;
  }
};

// Initialize database tables (SQL migrations for Supabase)
const initializeTables = async () => {
  try {
    // This would typically be done via Supabase migrations
    // For now, we'll assume tables are created via Supabase dashboard or migrations
    console.log('✅ Connected to Supabase database');

    // Test connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code === '42P01') {
      console.warn('⚠️ Database tables not found. Please run Supabase migrations.');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Initialize on module load
initializeTables();

module.exports = {
  supabase,
  runQuery,
  getQuery,
  allQuery
};