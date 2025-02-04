import { AlertCircle, HelpCircle } from 'lucide-react'

import { useParams } from 'common'
import Table from 'components/to-be-cleaned/Table'
import AlertError from 'components/ui/AlertError'
import { GenericSkeletonLoader } from 'components/ui/ShimmeringLoader'
import { useOrganizationRolesV2Query } from 'data/organization-members/organization-roles-query'
import { useOrganizationMembersQuery } from 'data/organizations/organization-members-query'
import { useProfile } from 'lib/profile'
import {
  Button,
  Loading,
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from 'ui'
import { MemberRow } from './MemberRow'
import { Admonition } from 'ui-patterns'

export interface MembersViewProps {
  searchString: string
}

const MembersView = ({ searchString }: MembersViewProps) => {
  const { slug } = useParams()
  const { profile } = useProfile()

  const {
    data: members,
    error: membersError,
    isLoading: isLoadingMembers,
    isError: isErrorMembers,
    isSuccess: isSuccessMembers,
  } = useOrganizationMembersQuery({ slug })
  const {
    data: roles,
    error: rolesError,
    isSuccess: isSuccessRoles,
    isError: isErrorRoles,
  } = useOrganizationRolesV2Query({
    slug,
  })

  const allMembers = members ?? []
  const filteredMembers = (
    !searchString
      ? allMembers
      : allMembers.filter((member) => {
          if (member.invited_at) {
            return member.primary_email?.includes(searchString)
          }
          if (member.gotrue_id) {
            return (
              member.username.includes(searchString) || member.primary_email?.includes(searchString)
            )
          }
        })
  )
    .slice()
    .sort((a, b) => {
      // [Joshen] Have own account show up top
      if (a.primary_email === profile?.primary_email) return -1
      return a.username.localeCompare(b.username)
    })

  const userMember = allMembers.find((m) => m.primary_email === profile?.primary_email)
  const orgScopedRoleIds = (roles?.org_scoped_roles ?? []).map((r) => r.id)
  const isOrgScopedRole = orgScopedRoleIds.includes(userMember?.role_ids?.[0] ?? -1)

  return (
    <>
      {isLoadingMembers && <GenericSkeletonLoader />}

      {isErrorMembers && (
        <AlertError error={membersError} subject="Failed to retrieve organization members" />
      )}

      {isErrorRoles && (
        <AlertError error={rolesError} subject="Failed to retrieve organization roles" />
      )}

      {isSuccessMembers && (
        <div className="rounded w-full">
          <Loading active={!filteredMembers}>
            <Table
              head={[
                <Table.th key="header-user">User</Table.th>,
                <Table.th key="header-status" className="w-24" />,
                <Table.th key="header-mfa" className="text-center w-32">
                  Enabled MFA
                </Table.th>,
                <Table.th key="header-role" className="flex items-center space-x-1">
                  <span>Role</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild type="text" className="px-1">
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href="https://supabase.com/docs/guides/platform/access-control"
                        >
                          <HelpCircle size={14} className="text-foreground-light" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      How to configure access control?
                    </TooltipContent>
                  </Tooltip>
                </Table.th>,
                <Table.th key="header-action" />,
              ]}
              body={[
                ...(isSuccessRoles && isSuccessMembers && !isOrgScopedRole
                  ? [
                      <Table.tr key="project-scope-notice">
                        <Table.td colSpan={12} className="!p-0">
                          <Admonition
                            type="note"
                            title="You are currently assigned with project scoped roles in this organization"
                            description="All the members within the organization will not be visible to you"
                            className="m-0 bg-alternative border-0 rounded-none"
                          />
                        </Table.td>
                      </Table.tr>,
                    ]
                  : []),
                ...filteredMembers.map((member) => (
                  <MemberRow key={member.gotrue_id} member={member} />
                )),
                ...(searchString.length > 0 && filteredMembers.length === 0
                  ? [
                      <Table.tr key="no-results" className="bg-panel-secondary-light">
                        <Table.td colSpan={12}>
                          <div className="flex items-center space-x-3 opacity-75">
                            <AlertCircle size={16} strokeWidth={2} />
                            <p className="text-foreground-light">
                              No users matched the search query "{searchString}"
                            </p>
                          </div>
                        </Table.td>
                      </Table.tr>,
                    ]
                  : []),
                <Table.tr key="footer" className="bg-panel-secondary-light">
                  <Table.td colSpan={12}>
                    <p className="text-foreground-light">
                      {searchString ? `${filteredMembers.length} of ` : ''}
                      {allMembers.length || '0'} {allMembers.length == 1 ? 'user' : 'users'}
                    </p>
                  </Table.td>
                </Table.tr>,
              ]}
            />
          </Loading>
        </div>
      )}
    </>
  )
}

export default MembersView
