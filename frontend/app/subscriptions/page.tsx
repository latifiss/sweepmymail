'use client'

import React from 'react'
import Bloc from '@/components/bloc'

const SubscriptionsPage = () => {
  return (
    <div className='subscriptions'>
        <div className='subscriptions__content'>
        <Bloc 
        title="Categorize" 
        caption="Organize your content into custom categories for better management" 
        type="categorize" 
      />

      {/* Summary Bloc */}
      <Bloc 
        title="Summary" 
        caption="Get AI-powered summaries of your content and activities" 
        type="summary" 
      />

      {/* Priority List Bloc */}
      <Bloc 
        title="Priority List" 
        caption="Manage and track your high-priority tasks efficiently" 
        type="list" 
      />
        </div>
    </div>
  )
}

export default SubscriptionsPage