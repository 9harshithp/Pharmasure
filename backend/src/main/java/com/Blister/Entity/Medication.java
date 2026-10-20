package com.Blister.Entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer mid;

    private String tableName;
    private Integer tabletQty;

    private String timing; // Morning, Afternoon, Evening
    private String doctor;

    private LocalDate expiryDate;

    @ManyToOne
    @JoinColumn(name = "p_id") // foreign key column
    private Patient patient;

    public Integer getTabletQty() {
        return tabletQty;
    }

    public void setTabletQty(Integer tabletQty) {
        this.tabletQty = tabletQty;
    }

    public String getTableName() {
        return tableName;
    }

    public String getDoctor() {
        return doctor;
    }

    public void setDoctor(String doctor) {
        this.doctor = doctor;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public Integer getMid() {
        return mid;
    }

    public void setMid(Integer mid) {
        this.mid = mid;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getTiming() {
        return timing;
    }

    public void setTiming(String timing) {
        this.timing = timing;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }
}
