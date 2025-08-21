<<<<<<< HEAD
cd web/DaoSystem
start cmd /k "npm run dev"
=======
cd web/my-app
start cmd /k "npm install && npm run dev"
>>>>>>> cba3bc8edf7c026bb754281e403b37c4f280d974
start http://localhost:5173

cd ../../myGeth
geth --datadir data --dev --http --http.api "eth,net,web3" --http.port 8545 --http.corsdomain "*" --networkid 1337
pause