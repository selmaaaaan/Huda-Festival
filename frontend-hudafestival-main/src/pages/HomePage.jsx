import React, { Suspense, lazy } from 'react';
import FestivalBelowFold from './FestivalBelowFold';

// The 3D journey pulls in three.js + postprocessing, so it is code-split into
// its own chunk and only loaded on the home route.
const WorldExperience = lazy(() => import('../world/WorldExperience'));

// Home page = a cinematic, interactive 3D journey through four festival worlds
// (Bastille → Tahrir → Syntagma → Tiananmen), followed by the standard
// festival content bands.
export default function HomePage() {
  return (
    <div className="relative">
      <Suspense
        fallback={
          <div className="h-screen w-full bg-gradient-to-b from-[#9ec7e8] via-[#cfe0ee] to-[#e9f2f8]" />
        }
      >
        <WorldExperience />
      </Suspense>
      <FestivalBelowFold />
    </div>
  );
}

