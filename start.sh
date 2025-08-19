gnome-terminal -- bash -c "cd web/DaoSystem && npm install && npm run dev; exec bash"
xdg-open http://localhost:5173

cd myGeth
./geth --datadir data --dev --http --http.api "eth,net,web3" --http.port 8545 --http.corsdomain "*" --networkid 1337
