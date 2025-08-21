<<<<<<< HEAD
gnome-terminal -- bash -c "cd web/DaoSystem && npm run dev; exec bash"
xdg-open http://localhost:5173
/home/user/Загрузки/Task_A_2025/web/DaoSystem/src
=======
gnome-terminal -- bash -c "cd web/DaoSystem && npm install && npm run dev; exec bash"
xdg-open http://localhost:5173

>>>>>>> cba3bc8edf7c026bb754281e403b37c4f280d974
cd myGeth
./geth --datadir data --dev --http --http.api "eth,net,web3" --http.port 8545 --http.corsdomain "*" --networkid 1337
