import { graphqlMutation, graphqlQuery } from "./graphqlClient";
import { extractGraphqlFieldError } from "../utils/graphqlFieldErrors";
import type {
  RequestStatus,
  RequestStatusChangePayload,
  RequestType,
  StudentRequestDetail,
  SupervisorRequestsData,
  UserSummary,
} from "../types/request";

export interface FetchSupervisorRequestsGraphqlOptions {
  requestType: RequestType;
  status?: RequestStatus;
  page?: number;
  pageSize?: number;
}

const REQUEST_FIELDS = `
  id
  requestType
  requestTypeDisplay
  status
  statusDisplay
  description
  createdAt
  updatedAt
  aiContentFlag
  rejectionReason
  supervisorResponse
  location
  extraDescription
  category
  photoUrl
  preferredDate
  itemId
  itemName
  quantity
  deliveryStatus
  name
  eventDate
  approvalDate
  user {
    id
    personnelCode
    firstName
    lastName
    roleName
  }
  handledBy {
    id
    personnelCode
    firstName
    lastName
    roleName
  }
  assignedStaff {
    id
    personnelCode
    firstName
    lastName
    roleName
  }
  statusTimeline {
    id
    previousStatus
    previousStatusDisplay
    newStatus
    newStatusDisplay
    comment
    rejectionReason
    createdAt
    actingSupervisor {
      id
      personnelCode
      firstName
      lastName
      roleName
    }
  }
`;

const ALL_REQUESTS_QUERY = `
query AllRequests(
  $status: String
  $requestType: String
  $page: Int
  $pageSize: Int
) {
  allRequests(
    status: $status
    requestType: $requestType
    page: $page
    pageSize: $pageSize
  ) {
    success
    message
    errors
    data {
      totalCount
      page
      pageSize
      items {
        ${REQUEST_FIELDS}
      }
    }
  }
}
`;

const CHANGE_STATUS_MUTATION = `
mutation ChangeRequestStatus(
  $requestId: Int!
  $newStatus: String!
  $comment: String
  $rejectionReason: String
  $supervisorResponse: String
  $assignedStaffId: Int
) {
  changeRequestStatus(
    requestId: $requestId
    newStatus: $newStatus
    comment: $comment
    rejectionReason: $rejectionReason
    supervisorResponse: $supervisorResponse
    assignedStaffId: $assignedStaffId
  ) {
    success
    message
    errors
    data {
      request {
        ${REQUEST_FIELDS}
      }
    }
  }
}
`;

interface GqlUserSummary {
  id: number;
  personnelCode: string;
  firstName: string;
  lastName: string;
  roleName: string | null;
}

interface GqlStatusHistory {
  id: number;
  previousStatus: RequestStatus | null;
  previousStatusDisplay: string | null;
  newStatus: RequestStatus;
  newStatusDisplay: string;
  comment: string;
  rejectionReason: string;
  createdAt: string;
  actingSupervisor: GqlUserSummary | null;
}

interface GqlRequest {
  id: number;
  requestType: RequestType;
  requestTypeDisplay: string;
  status: RequestStatus;
  statusDisplay: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  aiContentFlag: boolean | null;
  rejectionReason: string;
  supervisorResponse: string | null;
  location?: string;
  extraDescription?: string;
  category?: string;
  photoUrl?: string | null;
  preferredDate?: string;
  itemId?: number;
  itemName?: string;
  quantity?: number;
  deliveryStatus?: string;
  name?: string;
  eventDate?: string;
  approvalDate?: string | null;
  user: GqlUserSummary;
  handledBy: GqlUserSummary | null;
  assignedStaff: GqlUserSummary | null;
  statusTimeline: GqlStatusHistory[];
}

interface GqlRequestListResponse {
  allRequests: {
    success: boolean;
    message: string;
    errors: Record<string, string[]> | string | null;
    data: {
      totalCount: number;
      page: number;
      pageSize: number;
      items: GqlRequest[];
    } | null;
  };
}

interface GqlChangeStatusResponse {
  changeRequestStatus: {
    success: boolean;
    message: string;
    errors: Record<string, string[]> | string | null;
    data: {
      request: GqlRequest;
    } | null;
  };
}

function mapGqlUser(user: GqlUserSummary | null | undefined): UserSummary | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    personnel_code: user.personnelCode,
    first_name: user.firstName,
    last_name: user.lastName,
    role_name: user.roleName,
  };
}

function mapGqlRequest(request: GqlRequest): StudentRequestDetail {
  const detail: StudentRequestDetail = {
    id: request.id,
    request_type: request.requestType,
    request_type_display: request.requestTypeDisplay,
    status: request.status,
    status_display: request.statusDisplay,
    description: request.description,
    created_at: request.createdAt,
    updated_at: request.updatedAt,
    ai_content_flag: request.aiContentFlag,
    user: mapGqlUser(request.user)!,
    handled_by: mapGqlUser(request.handledBy),
    assigned_staff: mapGqlUser(request.assignedStaff),
    rejection_reason: request.rejectionReason ?? "",
    supervisor_response: request.supervisorResponse,
    status_timeline: request.statusTimeline.map((entry) => ({
      id: entry.id,
      previous_status: entry.previousStatus,
      previous_status_display: entry.previousStatusDisplay,
      new_status: entry.newStatus,
      new_status_display: entry.newStatusDisplay,
      acting_supervisor: mapGqlUser(entry.actingSupervisor),
      comment: entry.comment,
      rejection_reason: entry.rejectionReason,
      created_at: entry.createdAt,
    })),
    location: request.location,
    extra_description: request.extraDescription,
    category: request.category,
    photo_url: request.photoUrl,
    quantity: request.quantity,
    delivery_status: request.deliveryStatus,
    name: request.name,
    event_date: request.eventDate,
    approval_date: request.approvalDate,
  };

  if (request.itemId != null && request.itemName) {
    detail.item = {
      id: request.itemId,
      item_name: request.itemName,
    };
  }

  return detail;
}

export async function fetchSupervisorRequestsGraphql(
  accessToken: string,
  options: FetchSupervisorRequestsGraphqlOptions,
): Promise<SupervisorRequestsData> {
  const {
    requestType,
    status,
    page = 1,
    pageSize = 100,
  } = options;

  const data = await graphqlQuery<GqlRequestListResponse>({
    accessToken,
    document: ALL_REQUESTS_QUERY,
    variables: { status, requestType, page, pageSize },
    operationName: "AllRequests",
  });

  const payload = data.allRequests;
  if (!payload.success || !payload.data) {
    throw new Error(
      extractGraphqlFieldError(payload.message, payload.errors),
    );
  }

  return {
    count: payload.data.totalCount,
    next: null,
    previous: null,
    results: (payload.data.items ?? []).map(mapGqlRequest),
  };
}

export async function fetchSupervisorRequestDetailGraphql(
  accessToken: string,
  requestType: RequestType,
  requestId: number,
): Promise<StudentRequestDetail> {
  const data = await fetchSupervisorRequestsGraphql(accessToken, {
    requestType,
    page: 1,
    pageSize: 100,
  });
  const match = data.results.find((item) => item.id === requestId);

  if (!match) {
    throw new Error("درخواست مورد نظر یافت نشد.");
  }

  return match;
}

export async function updateSupervisorRequestStatusGraphql(
  accessToken: string,
  requestId: number,
  payload: RequestStatusChangePayload,
): Promise<StudentRequestDetail> {
  const data = await graphqlMutation<GqlChangeStatusResponse>({
    accessToken,
    document: CHANGE_STATUS_MUTATION,
    variables: {
      requestId,
      newStatus: payload.status,
      comment: payload.comment ?? payload.supervisor_response ?? "",
      rejectionReason: payload.rejection_reason,
      supervisorResponse: payload.supervisor_response,
      assignedStaffId: payload.assigned_staff_id,
    },
    operationName: "ChangeRequestStatus",
  });

  const result = data.changeRequestStatus;
  if (!result.success || !result.data?.request) {
    throw new Error(
      extractGraphqlFieldError(result.message, result.errors),
    );
  }

  return mapGqlRequest(result.data.request);
}
