import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Banner, Box, Loader, Avatar, Text, Icon, Button, BannerForm, AvatarForm } from "@inithium/ui";
import { Dialog } from "@inithium/ui";
import { useCurrentUser, useReadOneQuery } from "@inithium/store";

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: authUser } = useCurrentUser();
  const isOwnProfile = authUser?._id === userId;
  const { data: user, isLoading, isError } = useReadOneQuery(userId ?? '', {
    skip: !userId,
  });

  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  if (!userId || isLoading) return <Loader size={18} color="primary-contrast" />;
  if (isError || !user) return <Box p="4">Error loading profile.</Box>;

  const userInitials = ((user.first_name?.[0] ?? '') + (user.last_name?.[0] ?? '')).toUpperCase();

  const getGenderDisplay = (gender: typeof user.gender): string | null => {
    if (!gender?.type) return null;
    return gender.type === 'Other' ? (gender.custom ?? 'Other') : gender.type;
  };

  const genderLabel = getGenderDisplay(user.gender);

  useEffect(() => {console.log(user)}, [user])

  return (
    <Box direction="col" fullWidth bg="surface" color="surface-contrast" gap="0">
      <div className="relative">
        <Banner
          options={user.user_banner}
          height="240px"
          alt={`${user.first_name}'s Banner`}
        />
        {isOwnProfile && (
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant="filled"
              color="surface3"
              size="sm"
              onClick={() => setBannerDialogOpen(true)}
              className="!p-2"
              aria-label="Edit banner"
            >
              <Icon name="PencilSquareIcon" size="sm" />
            </Button>
          </div>
        )}
      </div>

      <Box direction="col" className="w-full md:w-5/6 lg:w-3/4 mx-auto">
        <Box
          px="4"
          className="mt-[-64px] z-10 flex flex-col md:flex-row items-center md:items-start"
        >
          <Box className="md:flex-3 flex justify-center md:justify-start">
            <div className="relative inline-block">
              <Avatar
                large
                initials={userInitials}
                options={{ gradient: user?.user_avatar?.gradient, variant: user?.user_avatar?.variant, font: user?.user_avatar?.font }}
                className="border-4 border-surface"
              />
              {isOwnProfile && (
                <div className="absolute bottom-1 right-1 z-10">
                  <Button
                    variant="filled"
                    color="surface3"
                    size="sm"
                    onClick={() => setAvatarDialogOpen(true)}
                    className="!p-1.5 rounded-full"
                    aria-label="Edit avatar"
                  >
                    <Icon name="PencilSquareIcon" size="xs" />
                  </Button>
                </div>
              )}
            </div>
          </Box>
          <Box className="hidden md:flex md:flex-9" />
        </Box>

        <Box
          p="4"
          gap="6"
          className="flex flex-col md:flex-row"
        >
          <Box
            direction="col"
            gap="2"
            className="w-full md:flex-3 items-center md:items-start text-center md:text-left"
          >
            <Box direction="row" align="center" gap="2">
              <Text size="lg" weight="bold" color="surface-contrast" font="display">
                {user.first_name} {user.last_name}
              </Text>
              <Text weight="bold" color="primary" size="sm">{isOwnProfile && "(you)"}</Text>
            </Box>

            <Box direction="col" gap="1" className="items-center md:items-start">
              <Box direction="row" align="center" gap="3">
                <Icon name="AtSymbolIcon" color="primary" size="sm" />
                <Text color="surface2-contrast" size="sm">{user.email}</Text>
              </Box>

              {genderLabel && (
                <Box direction="row" align="center" gap="3">
                  <Icon name="UserIcon" color="primary" size="sm" />
                  <Text color="surface2-contrast" size="sm">{genderLabel}</Text>
                </Box>
              )}

              {user.address && (
                <Box direction="row" align="center" gap="3">
                  <Icon name="HomeIcon" color="primary" size="sm" />
                  <Text color="surface2-contrast" size="sm">
                    {user.address.city}, {user.address.state}
                  </Text>
                </Box>
              )}

              {user.dob && (
                <Box direction="row" align="center" gap="3">
                  <Icon name="CakeIcon" color="primary" size="sm" />
                  <Text color="surface2-contrast" size="sm">{user.dob}</Text>
                </Box>
              )}
            </Box>
            <Text size="xs" color="surface2-contrast">{user.bio}</Text>
          </Box>

          <Box
            direction="col"
            className="w-full md:flex-9 min-h-[300px]"
            border={true}
            rounded="lg"
            p="8"
            justify="center"
            align="center"
          >
            <Text color="surface2-contrast">Profile Page Content Placeholder</Text>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={bannerDialogOpen}
        onClose={() => setBannerDialogOpen(false)}
        title="Edit Banner"
        description="Customise the trianglify pattern displayed behind your profile."
        color="primary"
        size="lg"
      >
        <BannerForm
          userId={userId}
          initial={user.user_banner}
          onSaved={() => setBannerDialogOpen(false)}
        />
      </Dialog>

      <Dialog
        open={avatarDialogOpen}
        onClose={() => setAvatarDialogOpen(false)}
        title="Edit Avatar"
        description="Choose a gradient, font, and shape for your profile picture."
        color="primary"
        size="base"
      >
        <AvatarForm
          userId={userId}
          initials={userInitials}
          initial={user.user_avatar}
          onSaved={() => setAvatarDialogOpen(false)}
        />
      </Dialog>
    </Box>
  );
};

export default Profile;