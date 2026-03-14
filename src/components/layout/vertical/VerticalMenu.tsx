// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Utils & Redux
import { useAppSelector } from '@/redux/hooks'
import { PERMISSIONS } from '@/constants/permissions'
import { hasPermission } from '@/utils/checkPermission'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: { scrollMenu: (container: any, isPerfectScrollbar: boolean) => void }) => {
  // Hooks
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()
  const { user } = useAppSelector(state => state.auth)
  const { myPermissions } = useAppSelector(state => state.permissions)

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const check = (permission: string) => hasPermission(user, myPermissions, permission)

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        {/* Dashboard - Free */}
        <MenuItem href='/' icon={<i className='ri-home-smile-line' />}>
          Dashboard
        </MenuItem>

        {/* Apps & Pages Section */}
        <MenuSection label='Apps & Pages'>
          {check(PERMISSIONS.MANAGE_USERS) && (
            <MenuItem href='/users' icon={<i className='ri-user-star-line' />}>
              User Management
            </MenuItem>
          )}

          {check(PERMISSIONS.MANAGE_PRODUCTS) && (
            <>
              <MenuItem href='/products' icon={<i className='ri-shopping-bag-3-line' />}>
                Product Management
              </MenuItem>
              <MenuItem href='/categories' icon={<i className='ri-list-check-2' />}>
                Category Management
              </MenuItem>
            </>
          )}

          {check(PERMISSIONS.MANAGE_ORDERS) && (
            <MenuItem href='/orders' icon={<i className='ri-file-list-3-line' />}>
              Order Management
            </MenuItem>
          )}

          {check(PERMISSIONS.MANAGE_CONTACTS) && (
            <MenuItem href='/contacts' icon={<i className='ri-customer-service-2-line' />}>
              Contact Management
            </MenuItem>
          )}

          {check(PERMISSIONS.MANAGE_VOUCHERS) && (
            <MenuItem href='/vouchers' icon={<i className='ri-ticket-2-line' />}>
              Voucher Management
            </MenuItem>
          )}

          {check(PERMISSIONS.MANAGE_ROLES) && (
            <>
              <MenuItem href='/roles' icon={<i className='ri-shield-user-line' />}>
                Role Management
              </MenuItem>
              <MenuItem href='/permissions' icon={<i className='ri-shield-keyhole-line' />}>
                Permission Management
              </MenuItem>
            </>
          )}

          <MenuItem href='/account-settings' icon={<i className='ri-user-settings-line' />}>
            Account Settings
          </MenuItem>

          <MenuItem href='/notifications' icon={<i className='ri-notification-3-line' />}>
            Notification History
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
