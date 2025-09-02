cd web/DaoSystem
start cmd /k "npm run dev"

start http://localhost:5173

cd ../../myGeth
geth --datadir data --dev --http --http.api "eth,net,web3" --http.port 8545 --http.corsdomain "*" --networkid 1337
pause