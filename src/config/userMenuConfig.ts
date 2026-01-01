export type UserMenuItem = {
  label: string;
  path?: string;
  action?: 'logout' | 'upload-photo';
  icon?: 'logout' | 'upload'|'addmember';
  requiresManager?: boolean;
};

export const userMenuConfig: UserMenuItem[] = [
  {
    label: 'Upload Photo',
    action: 'upload-photo',
    icon: 'upload',
  },
  {
    label: 'Add Member',
    path: '/add-member',
    icon:'addmember',
    requiresManager: true,
  },
  {
    label: 'Logout',
    action: 'logout',
    icon: 'logout',
  },
];
