import { WhatsAppViewer } from "@/components/WhatsAppViewer";

const Index = () => {
  return (
    <div className="h-screen">
      <WhatsAppViewer onReset={() => window.location.reload()} />
    </div>
  );
};

export default Index;
