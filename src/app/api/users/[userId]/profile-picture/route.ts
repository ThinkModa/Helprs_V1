import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const { profilePictureUrl } = await request.json()

    if (!profilePictureUrl) {
      return NextResponse.json(
        { error: 'Profile picture URL is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update the user's profile picture URL
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        profile_picture_url: profilePictureUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile picture:', error)
      return NextResponse.json(
        { error: 'Failed to update profile picture' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      user: data 
    })

  } catch (error) {
    console.error('Profile picture update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const supabase = await createClient()

    // Remove the profile picture URL
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        profile_picture_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error removing profile picture:', error)
      return NextResponse.json(
        { error: 'Failed to remove profile picture' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      user: data 
    })

  } catch (error) {
    console.error('Profile picture removal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
