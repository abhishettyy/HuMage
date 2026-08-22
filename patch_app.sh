sed -i 's/const targetEmp = isSelfProfile/const currentEmployee = role === "admin" ? employees[2] : employees[0];\n    const targetEmp = isSelfProfile/g' frontend/src/App.jsx
sed -i 's/onLogOut={() => {/onCheckIn={handleCheckIn}\n          onCheckOut={handleCheckOut}\n          employee={currentEmployee}\n          onLogOut={() => {/g' frontend/src/App.jsx
sed -i 's/onLogOut={() => setRole(null)}/onLogOut={() => setRole(null)}\n        onCheckIn={handleCheckIn}\n        onCheckOut={handleCheckOut}\n        employee={role === "admin" ? employees[2] : employees[0]}/g' frontend/src/App.jsx
