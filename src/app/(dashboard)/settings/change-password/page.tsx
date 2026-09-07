import React from 'react'
import SettingSidebar from '../_components/settings-sidebar'
import ChangePasswordForm from './_components/change-password-form'
import DashboardOverviewHeader from '../../_components/dashboard-overview-header'

const ChangePasswordPage = () => {
  return (
    <div className="settings-shell min-h-[calc(100vh-1px)]">
      <DashboardOverviewHeader title="Password & Security" description="Update your password and keep your dashboard account secure." showThemeToggle />
       <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-5 p-4 sm:p-6 xl:grid-cols-7">
        <div className="xl:col-span-2">

          <SettingSidebar />
        </div>
        <div className="min-w-0 xl:col-span-5">

          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordPage
