const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function setupStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('Setting up storage bucket...')

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      process.exit(1)
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'user-profiles')
    
    if (bucketExists) {
      console.log('✅ user-profiles bucket already exists')
    } else {
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket('user-profiles', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) {
        console.error('Error creating bucket:', error)
        process.exit(1)
      }

      console.log('✅ Created user-profiles bucket:', data)
    }

    console.log('🎉 Storage setup complete!')
    
  } catch (error) {
    console.error('Setup error:', error)
    process.exit(1)
  }
}

setupStorage()
