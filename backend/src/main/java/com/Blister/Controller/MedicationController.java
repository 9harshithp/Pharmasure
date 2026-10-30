package com.Blister.Controller;

import com.Blister.Entity.Medication;
import com.Blister.Entity.Patient;
import com.Blister.Repository.MedicationRepository;
import com.Blister.Repository.PatientRepository;
import com.Blister.security.InputSanitizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/medications")
public class MedicationController {

    @Autowired
    private MedicationRepository medicationRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private InputSanitizer inputSanitizer;

    // ✅ POST - Add a medication for a patient
    @PostMapping("/add/{patientId}")
    public ResponseEntity<?> addMedication(@PathVariable Integer patientId, @RequestBody Medication medication) {
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Patient not found with ID: " + patientId);
        }

        if (medication == null) {
            return ResponseEntity.badRequest().body("Medication data is required");
        }

        String sanitizedName = inputSanitizer.sanitizeText(medication.getTableName(), 150);
        if (sanitizedName == null || sanitizedName.isEmpty()) {
            return ResponseEntity.badRequest().body("Medication name is required");
        }

        Patient patient = patientOpt.get();
        medication.setTableName(sanitizedName);
        medication.setDoctor(inputSanitizer.sanitizeText(medication.getDoctor(), 100));
        medication.setTiming(inputSanitizer.sanitizeText(medication.getTiming(), 100));
        medication.setPatient(patient);

        Medication saved = medicationRepository.save(medication);
        return ResponseEntity.ok(saved);
    }

    // ✅ GET - Get all medications by patient ID
    @GetMapping("/get/patient/{patientId}")
    public List<Medication> getMedicationsByPatientId(@PathVariable Integer patientId) {
        return medicationRepository.findByPatient_Pid(patientId);
    }

    // ✅ PUT - Update an existing medication
    @PutMapping("/update/{mid}")
    public ResponseEntity<?> updateMedication(@PathVariable Integer mid, @RequestBody Medication updatedMedication) {
        Optional<Medication> existingMedOpt = medicationRepository.findById(mid);
        if (existingMedOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Medication not found with ID: " + mid);
        }

        Medication existingMed = existingMedOpt.get();

        if (updatedMedication.getTableName() != null)
            existingMed.setTableName(inputSanitizer.sanitizeText(updatedMedication.getTableName(), 150));
        if (updatedMedication.getTabletQty() != null)
            existingMed.setTabletQty(updatedMedication.getTabletQty());
        if (updatedMedication.getExpiryDate() != null)
            existingMed.setExpiryDate(updatedMedication.getExpiryDate());
        if (updatedMedication.getTiming() != null)
            existingMed.setTiming(inputSanitizer.sanitizeText(updatedMedication.getTiming(), 100));
        if (updatedMedication.getDoctor() != null)
            existingMed.setDoctor(inputSanitizer.sanitizeText(updatedMedication.getDoctor(), 100));

        Medication saved = medicationRepository.save(existingMed);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/delete/{mid}")
    public ResponseEntity<String> deleteMedication(@PathVariable Integer mid) {
        if (!medicationRepository.existsById(mid)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Medication not found with ID: " + mid);
        }
        medicationRepository.deleteById(mid);
        return ResponseEntity.ok("Medication deleted successfully (ID: " + mid + ")");
    }
}
