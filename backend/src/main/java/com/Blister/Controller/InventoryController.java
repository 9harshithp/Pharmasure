package com.Blister.Controller;

import com.Blister.Entity.Inventory;
import com.Blister.Repository.InventoryRepository;
import com.Blister.security.InputSanitizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InputSanitizer inputSanitizer;

    // ✅ POST - Add new inventory item (Admin Protected via SecurityFilter)
    @PostMapping
    public ResponseEntity<?> addInventory(@RequestBody Inventory inventory) {
        if (inventory == null) {
            return ResponseEntity.badRequest().body("Inventory data cannot be empty");
        }

        String sanitizedName = inputSanitizer.sanitizeText(inventory.getTableName(), 150);
        if (sanitizedName == null || sanitizedName.isEmpty()) {
            return ResponseEntity.badRequest().body("Medication name is required");
        }

        inventory.setTableName(sanitizedName);
        if (inventory.getTabletQty() != null && inventory.getTabletQty() < 0) {
            return ResponseEntity.badRequest().body("Tablet quantity cannot be negative");
        }
        if (inventory.getAmount() < 0) {
            return ResponseEntity.badRequest().body("Amount cannot be negative");
        }

        Inventory saved = inventoryRepository.save(inventory);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ✅ GET - Fetch all inventory items (Admin Protected)
    @GetMapping
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    // ✅ PUT - Update existing inventory item (Admin Protected)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateInventory(@PathVariable Integer id, @RequestBody Inventory updatedInventory) {
        Optional<Inventory> optionalInventory = inventoryRepository.findById(id);

        if (optionalInventory.isPresent()) {
            Inventory existing = optionalInventory.get();
            if (updatedInventory.getTableName() != null) {
                existing.setTableName(inputSanitizer.sanitizeText(updatedInventory.getTableName(), 150));
            }
            if (updatedInventory.getTabletQty() != null) {
                if (updatedInventory.getTabletQty() < 0) {
                    return ResponseEntity.badRequest().body("Quantity cannot be negative");
                }
                existing.setTabletQty(updatedInventory.getTabletQty());
            }
            if (updatedInventory.getAmount() >= 0) {
                existing.setAmount(updatedInventory.getAmount());
            }
            if (updatedInventory.getExpiryDate() != null) {
                existing.setExpiryDate(updatedInventory.getExpiryDate());
            }

            Inventory saved = inventoryRepository.save(existing);
            return ResponseEntity.ok(saved);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Inventory item not found with ID: " + id);
        }
    }
}
