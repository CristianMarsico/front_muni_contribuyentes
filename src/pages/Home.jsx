/**
 * Componente principal que determina la vista a renderizar según el rol y el estado del usuario.
 *
 * - Si el usuario es admin, se muestra la vista de contribuyentes (`Taxpayers`).
 * - Si el usuario es estándar y su estado es activo, se muestra la vista de declaraciones juradas (`MyDDJJ`).
 * - Si el usuario está en estado pendiente, se muestra un mensaje de aprobación (`PendingApproval`).
 *
 * @component
 * @returns {JSX.Element} Vista específica basada en el rol y estado del usuario.
 */

import React from 'react'
import { useAuth } from '../context/AuthProvider'
import PendingApproval from '../components/modalsComponents/PendingApproval';
import MyDDJJ from './MyDDJJ';
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