import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Settings, 
  AlertTriangle, 
  Activity,
  Shield
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/controls', icon: Settings, label: 'Controls' },
    { path: '/alerts', icon: AlertTriangle, label: 'Alerts' },
    { path: '/transactions', icon: Activity, label: 'Transactions' }
  ];

  return (
    <div className="w-64 bg-white shadow-sm h-screen">
      <div className="p-4">
        <div className="flex items-center mb-8">
          <Shield className="h-6 w-6 text-blue-600 mr-2" />
          <span className="font-semibold text-gray-900">Security Guard</span>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;