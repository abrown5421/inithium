import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { 
  Banner, 
  Box, 
  Loader, 
  Avatar, 
  Text, 
  Icon, 
  Button, 
  BannerForm, 
  AvatarForm, 
  Dialog, 
  Tabs
} from "@inithium/ui";
import { useCurrentUser, useReadOneQuery } from "@inithium/store";
import { AnimationObject } from "@inithium/types";
import { buildProfileTabs, PROFILE_TABS_REGISTRY } from "./profile-tabs.registry";

const Profile = () => {
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const { user: authUser } = useCurrentUser();

  const lastValidId = useRef<string | undefined>(urlUserId);
  if (urlUserId && urlUserId !== lastValidId.current) {
    lastValidId.current = urlUserId;
  }

  const activeUserId = urlUserId || lastValidId.current;
  const { data: user, isLoading, isError } = useReadOneQuery(activeUserId ?? '', {
    skip: !activeUserId,
  });

  const isOwnProfile = authUser?._id === activeUserId;
  const [isReady, setIsReady] = useState(false);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    return () => setIsReady(false);
  }, [isLoading, activeUserId, user]);

  if (!activeUserId || (isLoading && !user) || !isReady) {
    return (
      <Box direction="col" justify="center" align="center" className="w-full h-full">
        <Loader size={58} color="primary" />
      </Box>
    );
  }

  if (isError || !user) {
    return <Box p="4">Error loading profile.</Box>;
  }

  const userInitials = ((user.first_name?.[0] ?? '') + (user.last_name?.[0] ?? '')).toUpperCase();

  const getGenderDisplay = (gender: typeof user.gender): string | null => {
    if (!gender?.type) return null;
    return gender.type === 'Other' ? (gender.custom ?? 'Other') : gender.type;
  };

  const genderLabel = getGenderDisplay(user.gender);

  const profileAnimation: AnimationObject = {
    entry: 'fadeIn',
    exit: 'fadeOut',
    controller: {
      phase: isReady ? 'entered' : 'idle',
      triggerExit: async () => {},
      triggerEnter: () => {},
    }
  };

  return (
    <Box
      direction="col"
      fullWidth
      bg="surface"
      color="surface-contrast"
      animation={profileAnimation}
      className="h-shell"
    >
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

      <Box direction="col" className="w-full h-full lg:w-3/4 mx-auto">
        <Box
          px="4"
          className="mt-[-64px] z-10 flex flex-col items-center lg:items-start"
        >
          <Box className="lg:flex-3 flex justify-center lg:justify-start w-full">
            <div className="relative inline-block">
              <Avatar
                large
                initials={userInitials}
                options={{ 
                  gradient: user?.user_avatar?.gradient, 
                  variant: user?.user_avatar?.variant, 
                  font: user?.user_avatar?.font 
                }}
                className="border-4 border-surface shadow-lg"
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
        </Box>

        <Box
          p="4"
          gap="4"
          direction="col"
          className="flex lg:flex-row h-full"
        >
          <Box
            direction="col"
            gap="2"
            className="w-full h-full lg:flex-3 items-center lg:items-start text-center lg:text-left"
          >
            <Box direction="row" align="center" justify="center" className="lg:justify-start" gap="2">
              <Text size="lg" weight="bold" color="surface-contrast" font="display">
                {user.first_name} {user.last_name}
              </Text>
              <Text weight="bold" color="primary" size="sm">
                {isOwnProfile && "(you)"}
              </Text>
            </Box>

            <Box direction="col" gap="1" className="items-center lg:items-start">
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
            <Text size="xs" color="surface2-contrast" className="mt-2">{user.bio}</Text>
          </Box>

          <Box
            direction="col"
            gap="4"
            p="4"
            bg="surface2"
            rounded="md"
            className="w-full h-full lg:flex-9 mt-4 lg:mt-0 border border-surface2-contrast"
          >
            <Tabs
              tabs={buildProfileTabs(PROFILE_TABS_REGISTRY, isOwnProfile, activeUserId)}
              color="primary"
            />
          </Box>
        </Box>
      </Box>

      <Dialog
        open={bannerDialogOpen}
        onClose={() => setBannerDialogOpen(false)}
        title="Edit Banner"
        description="Customise the trianglify pattern displayed behind your profile."
        color="primary"
        size="full"
      >
        <BannerForm
          userId={activeUserId}
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
          userId={activeUserId}
          initials={userInitials}
          initial={user.user_avatar}
          onSaved={() => setAvatarDialogOpen(false)}
        />
      </Dialog>
    </Box>
  );
};

export default Profile;