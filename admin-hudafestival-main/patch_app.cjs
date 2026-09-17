const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  "import { motion, AnimatePresence } from 'framer-motion';",
  "import { motion, AnimatePresence } from 'framer-motion';\nimport PageTransition from './components/PageTransition';"
);

c = c.replace(
  /const ProtectedRoute = \(\{ children, allowedRoles \}\) => \{[\s\S]*?return children;\s*\};/g,
  `const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!userInfo) return <Navigate to="/" replace />;
    if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
      return <PageTransition><div className="p-8 text-red-500">Unauthorized</div></PageTransition>;
    }
    return <PageTransition className="h-full">{children}</PageTransition>;
  };`
);

fs.writeFileSync('src/App.jsx', c);
console.log("App.jsx patched for PageTransition");
