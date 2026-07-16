import React from 'react'
import { NavLink } from 'react-router-dom'

interface NavLinkProps {
    to: string
    children: React.ReactNode
}

const NavLinkComponent: React.FC<NavLinkProps> = ({ to, children }) => {
    return (
        <NavLink
            to={to}
            className={ ({ isActive }) =>
                ` text-black transition-all duration-200 ${
                    isActive
                        ? ' text-black '
                        : ' hover:bg-slate-100 hover:text-slate-900'
                }`
            }
        >
            {children}
        </NavLink>
    )
}

export default NavLinkComponent