import { initializeStorage } from '../../storage';

export async function onRequest(context: any) {
  const { params, env } = context;
  const partnerId = params.id;
  
  try {
    // Validate partner ID format (4 digits)
    if (!/^\d{4}$/.test(partnerId)) {
      return new Response(
        JSON.stringify({ message: "Partner ID must be exactly 4 digits" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if database is available
    if (!env.DB) {
      console.log('No database available, using in-memory storage');
      const { MemStorage } = await import('../../storage');
      const memStorage = new MemStorage();
      const partner = await memStorage.getPartner(partnerId);
      
      if (!partner) {
        return new Response(
          JSON.stringify({ message: "Partner ID not found. Please check your ID and try again." }), 
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(partner), 
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use D1 database
    try {
      const result = await env.DB.prepare('SELECT * FROM partners WHERE id = ?').bind(partnerId).first();
      
      if (!result) {
        return new Response(
          JSON.stringify({ message: "Partner ID not found. Please check your ID and try again." }), 
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(result), 
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Fall back to in-memory storage if database fails
      const { MemStorage } = await import('../../storage');
      const memStorage = new MemStorage();
      const partner = await memStorage.getPartner(partnerId);
      
      if (!partner) {
        return new Response(
          JSON.stringify({ message: "Partner ID not found. Please check your ID and try again." }), 
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(partner), 
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in partner lookup:', error);
    return new Response(
      JSON.stringify({ message: "Internal server error", error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
