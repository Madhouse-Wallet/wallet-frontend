// src/pages/sphere/page.tsx
import SphereRampWidget from '@/components/SphereWidget/SphereRampWidget';
import Wlogomw from "@/Assets/Images/logow.png";

export default function SpherePage() {
  const theme = {
    color: 'gray' as const,
    radius: 'lg' as const,
    components: {
      logo: `./favicn.png` // Add your logo to the public folder
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sphere Pay Integration</h1>
      <SphereRampWidget 
        applicationId={process.env.NEXT_PUBLIC_SPHERE_APP_ID || ''}
        // debug={process.env.NODE_ENV === 'development'}
        debug={false}
        theme={theme}
      />
    </main>
  );
}