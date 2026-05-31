import "server-only";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { requireServerSession } from "@/lib/backend/auth/session";
import {
  connectMongoClient,
  getMongoDatabase,
} from "@/lib/backend/mongodb/client";

type AdminSessionUser = {
  id: string;
  email?: string | null;
  admin?: boolean | string | null;
  role?: string | null;
};

type AuthUserAdminDocument = {
  id?: string | null;
  _id?: ObjectId | string;
  name?: string | null;
  email?: string | null;
  admin?: boolean | string | null;
  role?: string | null;
};

function hasAdminAccess(
  user: { admin?: unknown; role?: unknown } | null | undefined,
) {
  return (
    user?.admin === true || user?.admin === "true" || user?.role === "admin"
  );
}

function buildUserLookupFilter(user: AdminSessionUser) {
  const conditions: Array<Record<string, string | ObjectId>> = [
    { id: user.id },
  ];

  if (user.email) {
    conditions.push({ email: user.email });
  }

  conditions.push({ _id: user.id });

  if (ObjectId.isValid(user.id)) {
    conditions.push({ _id: new ObjectId(user.id) });
  }

  return { $or: conditions };
}

export async function getAuthUserAdminRecord(user: AdminSessionUser) {
  await connectMongoClient();

  const database = getMongoDatabase();
  const projection = {
    _id: 1,
    id: 1,
    name: 1,
    email: 1,
    admin: 1,
    role: 1,
  };

  for (const collectionName of ["users", "user"]) {
    const record = await database
      .collection<AuthUserAdminDocument>(collectionName)
      .findOne(buildUserLookupFilter(user), { projection });

    if (record) {
      return record;
    }
  }

  return null;
}

export async function requireAdminSession() {
  const session = await requireServerSession();

  if (hasAdminAccess(session.user)) {
    return session;
  }

  const userRecord = await getAuthUserAdminRecord({
    id: session.user.id,
    email: session.user.email,
  });

  if (!hasAdminAccess(userRecord)) {
    redirect("/");
  }

  return session;
}
