const fs = require('fs');
let content = fs.readFileSync('src/components/WaitlistModal.tsx', 'utf8');

content = content.replace(
  'img: "/images/real-estate.jpg"',
  'img: "/images/agent.jpg"'
);

fs.writeFileSync('src/components/WaitlistModal.tsx', content);
console.log('Reverted to agent.jpg');
