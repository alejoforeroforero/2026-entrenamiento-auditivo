# useAuth Hook

A custom React hook that wraps Next Auth's `useSession` to provide a cleaner, more convenient API for authentication state management.

## Usage

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      {isAdmin && <p>Admin access granted</p>}
    </div>
  );
}
```

## Return Values

| Property | Type | Description |
|----------|------|-------------|
| `session` | `Session \| null` | Full session object from NextAuth |
| `user` | `User \| null` | User object containing id, name, email, image, isAdmin |
| `isAuthenticated` | `boolean` | True when user is logged in (status === 'authenticated') |
| `isLoading` | `boolean` | True while session is being loaded |
| `isAdmin` | `boolean` | True if user has admin privileges |
| `status` | `'authenticated' \| 'loading' \| 'unauthenticated'` | Current authentication status |

## Examples

### Conditional Rendering Based on Auth State

```typescript
function ProtectedContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <LoginPrompt />;

  return <SecretContent />;
}
```

### Admin-Only Features

```typescript
function AdminPanel() {
  const { isAdmin, user } = useAuth();

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <AdminDashboard userId={user.id} />;
}
```

### User Profile Display

```typescript
function UserProfile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div>
      <img src={user.image || '/default-avatar.png'} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

## Testing

The hook is fully tested with 100% code coverage. See `__tests__/useAuth.test.ts` for test examples.
