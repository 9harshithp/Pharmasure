package com.Blister.Controller;

import com.Blister.Entity.Inventory;
import com.Blister.Repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin("*")
@RequestMapping("/inventory")
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    // ✅ POST - Add new inventory item
    @PostMapping
    public Inventory addInventory(@RequestBody Inventory inventory) {
        return inventoryRepository.save(inventory);
    }

    // ✅ GET - Fetch all inventory items
    @GetMapping
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    // ✅ PUT - Update existing inventory item
    @PutMapping("/{id}")
    public Inventory updateInventory(@PathVariable Integer id, @RequestBody Inventory updatedInventory) {
        Optional<Inventory> optionalInventory = inventoryRepository.findById(id);

        if (optionalInventory.isPresent()) {
            Inventory existing = optionalInventory.get();
            existing.setTableName(updatedInventory.getTableName());
            existing.setTabletQty(updatedInventory.getTabletQty());
            existing.setAmount(updatedInventory.getAmount());
            existing.setExpiryDate(updatedInventory.getExpiryDate());
            return inventoryRepository.save(existing);
        } else {
            throw new RuntimeException("Inventory item not found with ID: " + id);
        }
    }


}
