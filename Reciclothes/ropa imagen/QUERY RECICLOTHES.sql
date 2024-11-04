use RECICLOTHES;
select * from Productos;

#añadir columna imagen
ALTER TABLE Productos
ADD COLUMN imagen VARCHAR(250);

#sacar columna
ALTER TABLE Productos
DROP COLUMN imagen;

#añadir imagen
UPDATE Productos 
SET imagen = LOAD_FILE('C:\Users\Natzops\Desktop\subir/PRUEBA.jpg')
WHERE Id_Producto = 1;

#Primero, creamos el atributo 'imagen' en la tabla Productos:
ALTER TABLE Productos
ADD COLUMN imagen MEDIUMBLOB;

GRANT FILE ON RECICLOTHES TO 'avnadmin'@'servicioalochoro-prueba1631.l.aivencloud.com';
FLUSH PRIVILEGES;

SET GLOBAL max_allowed_packet=16777216;  -- 16MB

GRANT ALL PRIVILEGES ON RECICLOTHES.* TO 'avnadmin'@'servicioalochoro-prueba1631.l.aivencloud.com';
SHOW GRANTS FOR 'avnadmin'@'localhost';

GRANT ALL PRIVILEGES ON RECICLOTHES.* TO 'avnadmin'@'localhost';


