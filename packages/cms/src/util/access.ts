import type { Access } from 'payload'

export const ROLES = {
  ADMIN: 'admin',
  BLOG_EDITOR: 'blog_editor',
  INSTALLATION_EDITOR: 'installation_editor',
  READ_ONLY: 'read_only',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const PERMISSIONS = {
  MANAGE_USERS: 'manageUsers',
  EDIT_BLOGS: 'editBlogs',
  EDIT_INSTALLATIONS: 'editInstallations',
  UPLOAD_MEDIA: 'uploadMedia',
  DELETE_MEDIA: 'deleteMedia',
  VIEW_UNPUBLISHED: 'viewUnpublished',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

type UserWithRolesAndPermissions = {
  id: string | number
  roles?: Role[]
  permissions?: {
    manageUsers?: boolean
    editBlogs?: boolean
    editInstallations?: boolean
    uploadMedia?: boolean
    deleteMedia?: boolean
    viewUnpublished?: boolean
  }
}

function hasRole(user: unknown, roleOrRoles: Role | Role[]): boolean {
  const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles]
  const u = user as UserWithRolesAndPermissions | undefined
  return Boolean(u?.roles?.some((role) => roles.includes(role)))
}

export function hasPermission(
  user: unknown,
  permissionOrPermissions: Permission | Permission[],
): boolean {
  const permissions = Array.isArray(permissionOrPermissions)
    ? permissionOrPermissions
    : [permissionOrPermissions]
  const u = user as UserWithRolesAndPermissions | undefined
  return permissions.some((permission) => Boolean(u?.permissions?.[permission]))
}

function isAuthenticated(user: unknown): user is UserWithRolesAndPermissions {
  return Boolean(user)
}

// --- Role + permission predicates (use these for custom collection logic) ---

/** Admin via role or explicit permission */
export function userIsAdmin(user: unknown): boolean {
  return hasRole(user, ROLES.ADMIN) || hasPermission(user, PERMISSIONS.MANAGE_USERS)
}

/** Blog editor via role or explicit permission */
export function userIsBlogEditor(user: unknown): boolean {
  return hasRole(user, [ROLES.ADMIN, ROLES.BLOG_EDITOR]) || hasPermission(user, PERMISSIONS.EDIT_BLOGS)
}

/** Installation editor via role or explicit permission */
export function userIsInstallationEditor(user: unknown): boolean {
  return (
    hasRole(user, [ROLES.ADMIN, ROLES.INSTALLATION_EDITOR]) ||
    hasPermission(user, PERMISSIONS.EDIT_INSTALLATIONS)
  )
}

/** Content editor via role or explicit permission (blogs, installations, media upload) */
export function userIsContentEditor(user: unknown): boolean {
  return (
    hasRole(user, [ROLES.ADMIN, ROLES.BLOG_EDITOR, ROLES.INSTALLATION_EDITOR]) ||
    hasPermission(user, [
      PERMISSIONS.EDIT_BLOGS,
      PERMISSIONS.EDIT_INSTALLATIONS,
      PERMISSIONS.UPLOAD_MEDIA,
    ])
  )
}

/** Any logged-in user can open the admin panel; actual actions are still restricted by roles/permissions. */
export function userIsAuthenticatedUser(user: unknown): boolean {
  return isAuthenticated(user)
}

/** Can read unpublished/draft content. Any role or any content permission grants this. */
export function userCanViewUnpublished(user: unknown): boolean {
  if (!isAuthenticated(user)) return false
  if (hasRole(user, Object.values(ROLES))) return true
  return hasPermission(user, [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.EDIT_BLOGS,
    PERMISSIONS.EDIT_INSTALLATIONS,
    PERMISSIONS.UPLOAD_MEDIA,
    PERMISSIONS.DELETE_MEDIA,
    PERMISSIONS.VIEW_UNPUBLISHED,
  ])
}

// --- Access wrappers for collection configs ---

export const isAdmin: Access = ({ req: { user } }) => userIsAdmin(user)

export const isBlogEditor: Access = ({ req: { user } }) => userIsBlogEditor(user)

export const isInstallationEditor: Access = ({ req: { user } }) => userIsInstallationEditor(user)

export const isContentEditor: Access = ({ req: { user } }) => userIsContentEditor(user)

export const isAuthenticatedUser: Access = ({ req: { user } }) => userIsAuthenticatedUser(user)

export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (userCanViewUnpublished(user)) return true
  return {
    published: {
      equals: true,
    },
  }
}
