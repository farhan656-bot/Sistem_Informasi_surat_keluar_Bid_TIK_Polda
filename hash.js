const bcrypt = require('bcryptjs');

const users = [
    { name: 'Staff', pass: 'staff123' },
    { name: 'Pimpinan', pass: 'pimpinan123' },
    { name: 'Admin', pass: 'admin123' }
];

console.log("=== GENERATING NEW HASHES ===");
users.forEach(user => {
    bcrypt.hash(user.pass, 10, (err, hash) => {
        console.log(`${user.name} (${user.pass}) -> ${hash}`);
    });
});