import React from 'react'
import MyDDJJ from '../components/MyDDJJ';
import PendingApproval from '../components/PendingApproval';
import { useAuth } from '../context/AuthProvider'
import Taxpayers from './Taxpayers';

const Home = () => {
  const { user } = useAuth(); 
  return (
    <>
      {
        user.rol === 'admin' ? (
          <Taxpayers/>
        ) : (
          <>
            {
              user.estado == true ? (
                <MyDDJJ id={user?.id}/>

              ) : (
                <PendingApproval/>
              )
            }
          </>
        )
      }
    </>

  )
}

export default Home