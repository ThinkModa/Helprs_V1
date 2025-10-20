import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()

    // Create the user-profiles bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return NextResponse.json(
        { error: 'Failed to list storage buckets' },
        { status: 500 }
      )
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'user-profiles')
    
    if (!bucketExists) {
      const { data, error } = await supabase.storage.createBucket('user-profiles', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) {
        console.error('Error creating bucket:', error)
        return NextResponse.json(
          { error: 'Failed to create storage bucket' },
          { status: 500 }
        )
      }

      console.log('Created user-profiles bucket:', data)
    }

    // Set up RLS policies for the bucket
    const policies = [
      {
        name: 'Users can upload their own profile pictures',
        policy: `
          INSERT INTO storage.objects (bucket_id, name, owner, metadata)
          SELECT 'user-profiles', name, auth.uid(), metadata
          FROM storage.objects
          WHERE bucket_id = 'user-profiles'
          AND auth.uid()::text = (metadata->>'user_id')
        `
      },
      {
        name: 'Users can view profile pictures',
        policy: `
          SELECT FROM storage.objects
          WHERE bucket_id = 'user-profiles'
        `
      },
      {
        name: 'Users can update their own profile pictures',
        policy: `
          UPDATE storage.objects
          SET metadata = new_metadata
          WHERE bucket_id = 'user-profiles'
          AND auth.uid()::text = (metadata->>'user_id')
        `
      },
      {
        name: 'Users can delete their own profile pictures',
        policy: `
          DELETE FROM storage.objects
          WHERE bucket_id = 'user-profiles'
          AND auth.uid()::text = (metadata->>'user_id')
        `
      }
    ]

    // Note: In a real application, you would set up these policies via SQL
    // For now, we'll just log that they should be set up
    console.log('Storage bucket setup complete. RLS policies should be configured manually.')

    return NextResponse.json({ 
      success: true, 
      message: 'Storage bucket setup complete',
      bucketExists: bucketExists,
      bucketCreated: !bucketExists
    })

  } catch (error) {
    console.error('Storage setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
