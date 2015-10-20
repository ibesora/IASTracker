echo Creating the database...
sudo -u postgres -H sh -c "cd /home/ias/IASTracker/install/; psql --username=postgres -f preInstall.sql;"
echo Migrating...
cd ../web
php artisan migrate
echo Seeding...
php artisan db:seed
echo Importing states...
sudo -u iastracker -H sh -c "cd /home/ias/IASTracker/install/; psql --username=iastracker -d IASTrackerDB -f shapes/estats.sql > dev/null";
echo Importing regions...
sudo -u iastracker -H sh -c "cd /home/ias/IASTracker/install/; psql --username=iastracker -d IASTrackerDB -f shapes/regions.sql > dev/null";
echo Importing areas...
sudo -u iastracker -H sh -c "cd /home/ias/IASTracker/install/; psql --username=iastracker -d IASTrackerDB -f shapes/areas.sql > dev/null";
echo Post install...
sudo -u iastracker -H sh -c "cd /home/ias/IASTracker/install/; psql --username=iastracker -d IASTrackerDB -f postInstall.sql > output.txt 2>&1";
echo Ok!