// import React, { useEffect, useRef } from 'react'
// import { NavLink } from 'react-router-dom'
// import { useSelector, useDispatch } from 'react-redux'
// import {
//   CContainer,
//   CDropdown,
//   CDropdownItem,
//   CDropdownMenu,
//   CDropdownToggle,
//   CHeader,
//   CHeaderNav,
//   CHeaderToggler,
//   CNavLink,
//   CNavItem,
//   useColorModes,
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import {
//   cilBell,
//   cilContrast,
//   cilEnvelopeOpen,
//   cilList,
//   cilMenu,
//   cilMoon,
//   cilSun,
// } from '@coreui/icons'

// // import { AppBreadcrumb } from './index'
// import { AppHeaderDropdown } from './header/index'
// import { hide } from '@popperjs/core'
// import { set } from '../redux/uiSlice'

// const AppHeader = ({ userdata, auth, ...props }) => {
//   const { role, firstName } = useSelector((state) => state.auth.data)
//   const headerRef = useRef()

//   const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

//   const dispatch = useDispatch()
//   const { sidebarShow } = useSelector((state) => state.ui)

//   useEffect(() => {
//     document.addEventListener('scroll', () => {
//       headerRef.current &&
//         headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
//     })
//   }, [])

//   return (
//     <CHeader position="sticky" className="mb-1 p-0" ref={headerRef}>
//       <CContainer className="border-bottom px-4" fluid>
//         <CHeaderToggler
//           onClick={() => dispatch(set({ sidebarShow: !sidebarShow }))}
//           style={{ marginInlineStart: '-14px' }}
//         >
//           <CIcon
//             icon={cilMenu}
//             size="lg"
//             onClick={() => dispatch(set({ sidebarShow: !sidebarShow }))}
//           />
//         </CHeaderToggler>
//         <CHeaderNav className="ms-auto">
//           <CNavItem>
//             <CNavLink href="#">
//               <CIcon icon={cilBell} size="lg" />
//             </CNavLink>
//           </CNavItem>
//         </CHeaderNav>
//         <CHeaderNav style={{ alignItems: 'center' }}>
//           <li className="nav-item py-1">
//             <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
//           </li>
//           <CDropdown variant="nav-item" placement="bottom-end">
//             <CDropdownToggle caret={false}>
//               {colorMode === 'dark' ? (
//                 <CIcon icon={cilMoon} size="lg" />
//               ) : colorMode === 'auto' ? (
//                 <CIcon icon={cilContrast} size="lg" />
//               ) : (
//                 <CIcon icon={cilSun} size="lg" />
//               )}
//             </CDropdownToggle>
//             <CDropdownMenu>
//               <CDropdownItem
//                 active={colorMode === 'light'}
//                 className="d-flex align-items-center"
//                 as="button"
//                 type="button"
//                 onClick={() => {
//                   setColorMode('light')
//                   dispatch(set({ theme: 'light' }))
//                 }}
//               >
//                 <CIcon className="me-2" icon={cilSun} size="lg" /> Light
//               </CDropdownItem>
//               <CDropdownItem
//                 active={colorMode === 'dark'}
//                 className="d-flex align-items-center"
//                 as="button"
//                 type="button"
//                 onClick={() => {
//                   setColorMode('dark')
//                   dispatch(set({ theme: 'dark' }))
//                 }}
//               >
//                 <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
//               </CDropdownItem>
//               <CDropdownItem
//                 active={colorMode === 'auto'}
//                 className="d-flex align-items-center"
//                 as="button"
//                 type="button"
//                 onClick={() => setColorMode('auto')}
//               >
//                 <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
//               </CDropdownItem>
//             </CDropdownMenu>
//           </CDropdown>
//           <li className="user-info">{`Welcome ${firstName || 'Demo'} (${role || 'Demo'})`}</li>
//           <li className="nav-item py-1">
//             <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
//           </li>
//           <AppHeaderDropdown auth={auth} />
//         </CHeaderNav>
//       </CContainer>

//       {/* <div style={{height:40, width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
//         <AppBreadcrumb />
//       </div> */}
//     </CHeader>
//   )
// }

// export default AppHeader



import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilMenu } from '@coreui/icons'

import { AppHeaderDropdown } from './header/index'
import { set } from '../redux/uiSlice'

const AppHeader = ({ userdata, auth, ...props }) => {
  const { role, firstName } = useSelector((state) => state.auth.data)
  const { sidebarShow } = useSelector((state) => state.ui)
  const dispatch = useDispatch()
  const headerRef = useRef(null)

  // CoreUI color mode hook – we'll force light mode
  const { setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  // Add / remove shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        headerRef.current.classList.toggle(
          'shadow-sm',
          document.documentElement.scrollTop > 0,
        )
      }
    }

    document.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Force light theme across app
  useEffect(() => {
    setColorMode('light')
    dispatch(set({ theme: 'light' }))
  }, [dispatch, setColorMode])

  return (
    <CHeader position="sticky" className="mb-1 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch(set({ sidebarShow: !sidebarShow }))}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <CHeaderNav className="ms-auto">
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilBell} size="lg" />
            </CNavLink>
          </CNavItem>
        </CHeaderNav>

        <CHeaderNav style={{ alignItems: 'center' }}>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>

          <li className="user-info">
            {`Welcome ${firstName || 'Demo'} (${role || 'Demo'})`}
          </li>

          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>

          <AppHeaderDropdown auth={auth} />
        </CHeaderNav>
      </CContainer>

      {/* Breadcrumb placeholder if needed later */}
      {/* <div style={{height:40, width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <AppBreadcrumb />
      </div> */}
    </CHeader>
  )
}

export default AppHeader
