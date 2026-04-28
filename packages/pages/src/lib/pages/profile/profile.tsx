import { useParams } from "react-router-dom";
import { Banner, Box, Loader, Avatar } from "@inithium/ui";
import { useReadOneQuery } from "@inithium/store";
import { useEffect } from "react";

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  
  const { data: user, isLoading, isError } = useReadOneQuery(userId ?? '', {
    skip: !userId,
  });

  useEffect(() => {
    console.log("user state:", { user, isLoading, isError });
  }, [user, isLoading, isError]);

  if (!userId || isLoading) return <Loader size={18} color="primary-contrast" />;
  if (isError) return <Box p="4">Error loading user.</Box>;
  if (!user) return <Box p="4">No user data available.</Box>;

  const userInitials = (
    (user.first_name?.[0] ?? '') + 
    (user.last_name?.[0] ?? '')
  ).toUpperCase();

  return (
    <Box
      direction="col"
      fullWidth
      bg="surface"
      color="surface-contrast"
      gap="0" 
    >
      <Banner
        options={user.user_banner}
        height="240px"
        alt={`${user.first_name}'s Banner`}
      />

      <Box
        px="4"
        direction="col"
        align="start"
        className="w-full md:w-2/3 md:mx-auto mt-[-64px] z-10"
      >
        <Avatar
          large
          initials={userInitials}
          options={{ gradient: user?.user_avatar?.gradient }}
          className="border-4 border-surface" 
        />
      </Box>

      <Box
        p="4"
        direction="col"
        className="w-full md:w-2/3 md:mx-auto"
      >
        <h1 className="text-2xl font-bold">
          {user.first_name} {user.last_name}
        </h1>
        <p className="text-muted">User Profile Information</p>
      </Box>
    </Box>
  );
};

export default Profile;