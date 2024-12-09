import React from 'react'
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
                <h1>Pagina de contri</h1>

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