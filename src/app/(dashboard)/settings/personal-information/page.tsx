import React from 'react'
import SettingSidebar from '../_components/settings-sidebar'
import PersonalInformationForm from './_components/personal-information-form'
import DashboardOverviewHeader from '../../_components/dashboard-overview-header'

const PersonalInfoPage = () => {
  return (
    <div className='settings-shell min-h-[calc(100vh-1px)]'>
      <DashboardOverviewHeader title="Personal Information" description="Manage your profile, contact details, and public information." showThemeToggle />
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-5 p-4 sm:p-6 xl:grid-cols-7">
        <div className="xl:col-span-2">

          <SettingSidebar />
        </div>
        <div className="h-auto min-w-0 xl:col-span-5">

          <PersonalInformationForm />
        </div>
      </div>
    </div>
  )
}

export default PersonalInfoPage
