import { router } from "@inithium/router";
import { usePageTransition } from "@inithium/store";
import { Box, Button, Icon, Text } from "@inithium/ui";

const Error = () => {
  const { controller } = usePageTransition();

  const handlePageChange = async (e: React.MouseEvent, dest: string) => {
    e.preventDefault();
    await controller.triggerExit();
    router.navigate(dest);
  };

  return (
    <Box
      display="flex"
      direction="col"
      align="center"
      justify="center"
      gap="4"
      p="4"
      rounded="xl"
      bg="surface2"
      border
      borderColor="surface3"
      className="max-w-lg mx-auto shadow-2xl"
    >
      <Box 
        p="4" 
        rounded="full" 
        className="animate-pulse"
      >
        <Icon name="ShieldExclamationIcon" color="danger" size="2xl" />
      </Box>

      <Box direction="col" align="center" gap="2">
        <Text font="display" weight="black" size="4xl" color="danger">
          500
        </Text>
        <Text weight="medium" size="xl" color="surface2-contrast">
          System Error
        </Text>
      </Box>

      <Text color="surface2-contrast" className="opacity-80 text-center px-8">
        Something went wrong on our end. We've been notified and are looking into it. 
        Please try refreshing or heading back to safety.
      </Text>

      <Box direction="row" gap="4" mt="2">
        <Button 
          color="danger" 
          onClick={(e) => handlePageChange(e, "/")}
          className="transition-transform active:scale-95"
        >
          Go Home
        </Button>
        <Button 
          color="surface3" 
          onClick={() => window.history.back()}
          className="transition-transform active:scale-95"
        >
          Go Back
        </Button>
      </Box>
    </Box>
  );
};

export default Error;