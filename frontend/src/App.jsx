import React, {
  useState,
} from "react";

import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import Users from "./pages/Users";
import UserDashboard from "./pages/UserDashboard";


export default function App() {

  const [
    user,
    setUser,
  ] = useState(null);


  const [
    page,
    setPage,
  ] = useState("login");


  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);


  function handleLogin(
    loggedInUser
  ) {

    setUser(
      loggedInUser
    );

    setPage("chat");

  }


  function logout() {

    localStorage.removeItem(
      "zynora_token"
    );

    localStorage.removeItem(
      "zynora_user"
    );

    setUser(null);

    setSelectedUser(null);

    setPage("login");

  }


  function openAdmin() {

    if (
      user?.role?.toUpperCase() ===
      "ADMIN"
    ) {

      setPage("admin");

    }

  }


  function openUsers() {

    if (
      user?.role?.toUpperCase() ===
      "ADMIN"
    ) {

      setPage("users");

    }

  }


  function openUserDashboard(
    selected
  ) {

    if (
      user?.role?.toUpperCase() !==
      "ADMIN"
    ) {
      return;
    }

    setSelectedUser(
      selected
    );

    setPage(
      "user-dashboard"
    );

  }


  if (!user) {

    return (
      <Login
        onLogin={
          handleLogin
        }
      />
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Individual User Dashboard
  |--------------------------------------------------------------------------
  */

  if (
    page ===
      "user-dashboard" &&
    user.role?.toUpperCase() ===
      "ADMIN" &&
    selectedUser
  ) {

    return (
      <UserDashboard
        user={selectedUser}
        onBack={openUsers}
        onLogout={logout}
      />
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Users
  |--------------------------------------------------------------------------
  */

  if (
    page === "users" &&
    user.role?.toUpperCase() ===
      "ADMIN"
  ) {

    return (
      <Users
        onBack={openAdmin}
        onUserSelect={
          openUserDashboard
        }
        onLogout={logout}
      />
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Admin Dashboard
  |--------------------------------------------------------------------------
  */

  if (
    page === "admin" &&
    user.role?.toUpperCase() ===
      "ADMIN"
  ) {

    return (
      <Admin
        onBack={() =>
          setPage("chat")
        }
        onUsers={openUsers}
        onLogout={logout}
      />
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Normal Chat
  |--------------------------------------------------------------------------
  */

  return (
    <Chat
      user={user}
      onAdmin={openAdmin}
      onLogout={logout}
    />
  );
}