
Feature: Gestión de órdenes en Petstore

  Background:
    Given que tengo acceso a la API de Petstore

  Scenario: Consultar una orden de compra
    Given que he creado una orden con ID 5
    When consulto la orden con ID 5
    Then la respuesta debe tener código 200

  Scenario: Crear y consultar una orden
    Given que he creado una orden con ID 10
    When consulto la orden con ID 10
    Then la respuesta debe contener el ID 10 y status y quantity

  Scenario: Verificar el inventario de ventas
    When consulto el inventario de ventas
    Then la respuesta debe tener código 200
    And el inventario debe contener las claves sold y available en el body

  Scenario: Eliminar una orden de compra
    Given que he creado una orden con ID 15
    When elimino la orden con ID 15
    Then la respuesta debe tener código 200
    And al consultar la orden con el ID 15 debe mostrar el message "Order not found"

