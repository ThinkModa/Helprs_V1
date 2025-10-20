#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Supabase URL or Service Role Key is missing. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const createAuthUser = async (email, password) => {
  // First check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers.users.find(user => user.email === email);
  
  if (existingUser) {
    console.warn(`⚠️  User already exists: ${email}`);
    return existingUser;
  }

  // Create new user if doesn't exist
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    throw error;
  }
  return data.user;
};

const createCompany = async (name, slug, industry, employeeRange, subscriptionTier, createdBy) => {
  // First check if company already exists
  const { data: existingCompany } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (existingCompany) {
    console.warn(`⚠️  Company already exists: ${name}`);
    return existingCompany;
  }

  // Create new company if doesn't exist
  const { data, error } = await supabase
    .from('companies')
    .insert({
      name,
      slug,
      industry,
      employee_range: employeeRange,
      subscription_tier: subscriptionTier,
      subscription_status: 'active',
      is_active: true,
      created_by: createdBy,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

const createUserProfile = async (id, email, firstName, lastName, role, companyId = null) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id,
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      company_id: companyId,
    })
    .select()
    .single();
  if (error) {
    if (error.message.includes('duplicate key value violates unique constraint "user_profiles_pkey"')) {
      console.warn(`⚠️  Profile for user ${email} already exists. Updating...`);
      const { data: updatedData, error: updateError } = await supabase
        .from('user_profiles')
        .update({ company_id: companyId, role })
        .eq('id', id)
        .select()
        .single();
      if (updateError) throw updateError;
      return updatedData;
    }
    throw error;
  }
  return data;
};

const createSampleCalendars = async (companyId) => {
  const calendars = [
    {
      name: 'House Cleaning Team',
      description: 'Team responsible for residential cleaning services',
      color: '#10B981',
      calendar_type: 'team',
      sort_order: 1
    },
    {
      name: 'Office Cleaning Team', 
      description: 'Team responsible for commercial cleaning services',
      color: '#3B82F6',
      calendar_type: 'team',
      sort_order: 2
    },
    {
      name: 'Downtown Area',
      description: 'All work in the downtown district',
      color: '#F59E0B',
      calendar_type: 'location',
      sort_order: 3
    },
    {
      name: 'North Side',
      description: 'All work in the northern part of the city',
      color: '#EF4444',
      calendar_type: 'location',
      sort_order: 4
    },
    {
      name: 'Plumbing Team',
      description: 'Specialized plumbing services',
      color: '#8B5CF6',
      calendar_type: 'specialization',
      sort_order: 5
    }
  ];

  for (const calendar of calendars) {
    const { data, error } = await supabase
      .from('calendars')
      .insert({
        company_id: companyId,
        ...calendar
      })
      .select()
      .single();
    
    if (error) {
      console.warn(`⚠️  Calendar ${calendar.name} already exists or error:`, error.message);
    } else {
      console.log(`✅ Created calendar: ${calendar.name}`);
    }
  }
};

const createSampleForms = async (companyId) => {
  const forms = [
    {
      name: 'Contact Information',
      description: 'Basic customer contact details',
      form_type: 'contact',
      form_schema: {
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'email', type: 'email', required: true },
          { name: 'phone', type: 'tel', required: false }
        ]
      }
    },
    {
      name: 'Cleaning Checklist',
      description: 'Standard cleaning completion checklist',
      form_type: 'checklist',
      form_schema: {
        fields: [
          { name: 'rooms_cleaned', type: 'number', required: true },
          { name: 'quality_rating', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'], required: true }
        ]
      }
    },
    {
      name: 'Safety Inspection',
      description: 'Safety checklist for work completion',
      form_type: 'inspection',
      form_schema: {
        fields: [
          { name: 'safety_equipment', type: 'checkbox', required: true },
          { name: 'hazards_identified', type: 'textarea', required: false }
        ]
      }
    }
  ];

  for (const form of forms) {
    const { data, error } = await supabase
      .from('forms')
      .insert({
        company_id: companyId,
        ...form
      })
      .select()
      .single();
    
    if (error) {
      console.warn(`⚠️  Form ${form.name} already exists or error:`, error.message);
    } else {
      console.log(`✅ Created form: ${form.name}`);
    }
  }
};

async function seedTestData() {
  console.log('🌱 Seeding test data...');

  try {
    // 1. Create Super Admin
    console.log('\n👑 Creating Super Admin account...');
    const superAdminAuth = await createAuthUser('admin@helprs.com', 'admin123');
    console.log(`✅ Super Admin auth created: ${superAdminAuth.email}`);

    // 2. Create The Home Team Company & Admin
    console.log('\n🏠 Creating The Home Team company...');
    const homeTeamCompany = await createCompany(
      'The Home Team',
      'the-home-team',
      'Moving And Storage / Moving Labor',
      '51-100',
      'basic',
      superAdminAuth.id
    );
    console.log(`✅ The Home Team company created: ${homeTeamCompany.name}`);

    console.log('\n👤 Creating The Home Team admin user...');
    const homeTeamAdminAuth = await createAuthUser('admin@thehometeam.com', 'hometeam123');
    console.log(`✅ The Home Team auth created: ${homeTeamAdminAuth.email}`);
    await createUserProfile(
      homeTeamAdminAuth.id,
      homeTeamAdminAuth.email,
      'Home',
      'Admin',
      'owner',
      homeTeamCompany.id
    );
    console.log('✅ The Home Team profile created');

    // 3. Create Primetime Moving Company & Admin
    console.log('\n🚛 Creating Primetime Moving company...');
    const primetimeMovingCompany = await createCompany(
      'Primetime Moving',
      'primetime-moving',
      'Moving And Storage / Moving Labor',
      '26-50',
      'professional',
      superAdminAuth.id
    );
    console.log(`✅ Primetime Moving company created: ${primetimeMovingCompany.name}`);

    console.log('\n👤 Creating Primetime Moving admin user...');
    const primetimeMovingAdminAuth = await createAuthUser('admin@primetimemoving.com', 'primetime123');
    console.log(`✅ Primetime Moving auth created: ${primetimeMovingAdminAuth.email}`);
    await createUserProfile(
      primetimeMovingAdminAuth.id,
      primetimeMovingAdminAuth.email,
      'Prime',
      'Admin',
      'owner',
      primetimeMovingCompany.id
    );
    console.log('✅ Primetime Moving profile created');

    // 4. Create Super Admin profile
    console.log('\n👑 Creating Super Admin profile...');
    await createUserProfile(
      superAdminAuth.id,
      superAdminAuth.email,
      'Super',
      'Admin',
      'owner'
    );
    console.log('✅ Super Admin profile created');

    // 5. Create sample calendars for The Home Team
    console.log('\n📅 Creating sample calendars for The Home Team...');
    await createSampleCalendars(homeTeamCompany.id);

    // 6. Create sample forms for The Home Team
    console.log('\n📝 Creating sample forms for The Home Team...');
    await createSampleForms(homeTeamCompany.id);

    console.log('\n🎉 Test data seeding complete!');
    console.log('\n📋 Quick Access Accounts:');
    console.log('👑 Super Admin: admin@helprs.com / admin123');
    console.log('🏠 The Home Team: admin@thehometeam.com / hometeam123');
    console.log('🚛 Primetime Moving: admin@primetimemoving.com / primetime123');

  } catch (error) {
    console.error('❌ Error seeding test data:', error.message);
    process.exit(1);
  }
}

// Run the seeding function
seedTestData();
