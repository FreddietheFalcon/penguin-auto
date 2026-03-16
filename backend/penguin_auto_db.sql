-- ============================================
-- Penguin Auto Specialists Database
-- CIS4510 - IT Project Management
-- Run this in phpMyAdmin or MySQL Workbench
-- ============================================

CREATE DATABASE IF NOT EXISTS penguin_auto;
USE penguin_auto;

-- ─────────────────────────────────────────────
-- 1. CUSTOMERS
-- ─────────────────────────────────────────────
CREATE TABLE customers (
    customer_id     INT           NOT NULL AUTO_INCREMENT,
    first_name      VARCHAR(50)   NOT NULL,
    last_name       VARCHAR(50)   NOT NULL,
    street_address  VARCHAR(100)  NOT NULL,
    city            VARCHAR(50)   NOT NULL,
    zip_code        VARCHAR(10)   NOT NULL,
    email_address   VARCHAR(100)  NOT NULL,
    phone_number    VARCHAR(15)   NOT NULL,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id),
    UNIQUE KEY uq_customer_email (email_address)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 2. VEHICLES
-- ─────────────────────────────────────────────
CREATE TABLE vehicles (
    vehicle_id      INT           NOT NULL AUTO_INCREMENT,
    customer_id     INT           NOT NULL,
    make            VARCHAR(50)   NOT NULL,
    model           VARCHAR(50)   NOT NULL,
    year            YEAR(4)       NOT NULL,
    color           VARCHAR(30)   NULL,
    license_plate   VARCHAR(20)   NULL,
    vin_number      VARCHAR(17)   NOT NULL,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (vehicle_id),
    UNIQUE KEY uq_vin (vin_number),
    UNIQUE KEY uq_plate (license_plate),
    CONSTRAINT fk_vehicle_customer
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 3. EMPLOYEES
-- ─────────────────────────────────────────────
CREATE TABLE employees (
    employee_id     INT             NOT NULL AUTO_INCREMENT,
    first_name      VARCHAR(50)     NOT NULL,
    last_name       VARCHAR(50)     NOT NULL,
    street_address  VARCHAR(100)    NOT NULL,
    city            VARCHAR(50)     NOT NULL,
    zip_code        VARCHAR(10)     NOT NULL,
    email_address   VARCHAR(100)    NOT NULL,
    phone_number    VARCHAR(15)     NOT NULL,
    hourly_wage     DECIMAL(8,2)    NOT NULL,
    position        VARCHAR(50)     NOT NULL,
    hire_date       DATE            NOT NULL,
    is_active       TINYINT(1)      DEFAULT 1,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (employee_id),
    UNIQUE KEY uq_emp_email (email_address)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 4. PARTS
-- ─────────────────────────────────────────────
CREATE TABLE parts (
    part_id             INT             NOT NULL AUTO_INCREMENT,
    part_name           VARCHAR(100)    NOT NULL,
    part_number         VARCHAR(50)     NULL,
    vendor_name         VARCHAR(100)    NOT NULL,
    vendor_contact      VARCHAR(100)    NULL,
    unit_cost           DECIMAL(10,2)   NOT NULL,
    quantity_on_hand    INT             DEFAULT 0,
    reorder_threshold   INT             DEFAULT 5,
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (part_id),
    UNIQUE KEY uq_part_number (part_number)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 5. SERVICES
-- ─────────────────────────────────────────────
CREATE TABLE services (
    service_id          INT             NOT NULL AUTO_INCREMENT,
    service_name        VARCHAR(100)    NOT NULL,
    service_description TEXT            NULL,
    hourly_rate         DECIMAL(8,2)    NOT NULL,
    estimated_hours     DECIMAL(4,2)    NULL,
    is_active           TINYINT(1)      DEFAULT 1,
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (service_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 6. REPAIRS
-- ─────────────────────────────────────────────
CREATE TABLE repairs (
    repair_id       INT                                                         NOT NULL AUTO_INCREMENT,
    vehicle_id      INT                                                         NOT NULL,
    employee_id     INT                                                         NULL,
    service_id      INT                                                         NOT NULL,
    scheduled_date  DATE                                                        NOT NULL,
    scheduled_time  TIME                                                        NOT NULL,
    status          ENUM('Planned','In Progress','Completed','Cancelled')       DEFAULT 'Planned',
    completion_date DATE                                                        NULL,
    notes           TEXT                                                        NULL,
    labor_hours     DECIMAL(4,2)                                                NULL,
    created_at      TIMESTAMP                                                   DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP                                                   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (repair_id),
    CONSTRAINT fk_repair_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_repair_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_repair_service
        FOREIGN KEY (service_id) REFERENCES services(service_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 7. REPAIR_PARTS (Junction Table)
-- ─────────────────────────────────────────────
CREATE TABLE repair_parts (
    repair_id           INT             NOT NULL,
    part_id             INT             NOT NULL,
    quantity_used       INT             NOT NULL DEFAULT 1,
    unit_cost_at_time   DECIMAL(10,2)   NOT NULL,
    PRIMARY KEY (repair_id, part_id),
    CONSTRAINT fk_rp_repair
        FOREIGN KEY (repair_id) REFERENCES repairs(repair_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rp_part
        FOREIGN KEY (part_id) REFERENCES parts(part_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 8. TRANSACTIONS
-- ─────────────────────────────────────────────
CREATE TABLE transactions (
    transaction_id      INT                                                         NOT NULL AUTO_INCREMENT,
    repair_id           INT                                                         NOT NULL,
    transaction_date    DATETIME                                                    DEFAULT CURRENT_TIMESTAMP,
    amount              DECIMAL(10,2)                                               NOT NULL,
    payment_method      ENUM('Cash','Credit Card','Debit Card','Check','Other')     NOT NULL,
    routing_number      VARCHAR(50)                                                 NULL,
    invoice_number      VARCHAR(20)                                                 NOT NULL,
    payment_status      ENUM('Pending','Paid','Refunded','Failed')                  DEFAULT 'Pending',
    notes               TEXT                                                        NULL,
    created_at          TIMESTAMP                                                   DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (transaction_id),
    UNIQUE KEY uq_invoice (invoice_number),
    CONSTRAINT fk_trans_repair
        FOREIGN KEY (repair_id) REFERENCES repairs(repair_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- SAMPLE SEED DATA
-- ─────────────────────────────────────────────

-- Services
INSERT INTO services (service_name, service_description, hourly_rate, estimated_hours) VALUES
('Oil Change',          'Standard oil and filter replacement',              45.00,  0.50),
('Tire Rotation',       'Rotate all four tires for even wear',              35.00,  0.50),
('Brake Inspection',    'Inspect brake pads, rotors, and calipers',         65.00,  1.00),
('Brake Replacement',   'Replace front or rear brake pads and rotors',      95.00,  2.50),
('Engine Diagnostic',   'Full engine diagnostic with OBD scanner',          85.00,  1.00),
('Transmission Service','Fluid flush and filter replacement',               120.00, 2.00),
('AC Service',          'Refrigerant recharge and system inspection',       110.00, 1.50),
('Battery Replacement', 'Test and replace vehicle battery',                 55.00,  0.50),
('Wheel Alignment',     'Four-wheel alignment and adjustment',              80.00,  1.00),
('Full Tune-Up',        'Spark plugs, air filter, fuel filter replacement', 150.00, 3.00);

-- Parts
INSERT INTO parts (part_name, part_number, vendor_name, vendor_contact, unit_cost, quantity_on_hand, reorder_threshold) VALUES
('Oil Filter',          'OF-1234',  'AutoParts Co',     '555-100-1001',  4.99,  25, 5),
('Air Filter',          'AF-5678',  'AutoParts Co',     '555-100-1001',  12.99, 15, 5),
('Brake Pads (Front)',  'BP-9012',  'BrakeMaster',      '555-200-2002',  34.99, 20, 5),
('Brake Rotor (Front)', 'BR-3456',  'BrakeMaster',      '555-200-2002',  59.99, 10, 3),
('Spark Plugs (Set)',   'SP-7890',  'IgnitionPros',     '555-300-3003',  18.99, 30, 8),
('Transmission Fluid',  'TF-2345',  'FluidWorks',       '555-400-4004',  9.99,  20, 5),
('Engine Oil (5W-30)',  'EO-6789',  'OilTech Supply',   '555-500-5005',  8.49,  40, 10),
('Car Battery (Group 35)', 'CB-1122','PowerCell Inc',   '555-600-6006',  89.99, 8,  3),
('AC Refrigerant R134a','AC-3344',  'CoolAir Parts',    '555-700-7007',  24.99, 12, 4),
('Fuel Filter',         'FF-5566',  'AutoParts Co',     '555-100-1001',  14.99, 18, 5);

-- Employees
INSERT INTO employees (first_name, last_name, street_address, city, zip_code, email_address, phone_number, hourly_wage, position, hire_date) VALUES
('Marcus',  'Williams',  '101 Garage Ln',    'DeLand',   '32720', 'marcus.w@penguinauto.com',  '386-555-0101', 28.50, 'Lead Technician',  '2020-03-15'),
('Diana',   'Reyes',     '202 Motor Ave',    'DeLand',   '32724', 'diana.r@penguinauto.com',   '386-555-0202', 24.00, 'Technician',       '2021-07-01'),
('Carlos',  'Nguyen',    '303 Wrench Blvd',  'Orange City','32763','carlos.n@penguinauto.com', '386-555-0303', 22.00, 'Technician',       '2022-01-10'),
('Patricia','Johnson',   '404 Service Rd',   'DeLand',   '32720', 'patricia.j@penguinauto.com','386-555-0404', 20.00, 'Service Advisor',  '2021-11-05'),
('Owen',    'Patel',     '505 Lube Ct',      'Deltona',  '32725', 'owen.p@penguinauto.com',    '386-555-0505', 18.50, 'Lube Technician',  '2023-02-20');

-- Customers
INSERT INTO customers (first_name, last_name, street_address, city, zip_code, email_address, phone_number) VALUES
('James',   'Carter',   '12 Oak St',        'DeLand',       '32720', 'jcarter@email.com',    '386-555-1001'),
('Sofia',   'Martinez', '34 Pine Ave',      'Deltona',      '32725', 'sofia.m@email.com',    '386-555-1002'),
('Brian',   'Thompson', '56 Maple Dr',      'Orange City',  '32763', 'bthompson@email.com',  '386-555-1003');

-- Vehicles
INSERT INTO vehicles (customer_id, make, model, year, color, license_plate, vin_number) VALUES
(1, 'Toyota',   'Camry',    2019, 'Silver',  'ABC-1234', '1HGCM82633A123456'),
(2, 'Honda',    'Civic',    2021, 'Blue',    'XYZ-5678', '2T1BURHE0JC043821'),
(3, 'Ford',     'F-150',    2018, 'Black',   'DEF-9012', '1FTEW1EP5JFC12345');
